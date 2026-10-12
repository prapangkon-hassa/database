import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { createApp } from "../src/app.js";
import { Pool } from "pg";
import { getInventory } from "../src/services/products.service.js";
import { disconnectDatabase } from "../src/lib/db.js";

test("API runs without connecting to a database; product endpoints explicitly report disabled DB", async () => {
  process.env.ENABLE_DATABASE = "false";
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    assert(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;
    const health = await fetch(base + "/api/health", {
      headers: { Origin: "http://localhost:3000" },
    });
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {
      status: "ok",
      databaseEnabled: false,
    });
    assert.equal(
      health.headers.get("access-control-allow-origin"),
      "http://localhost:3000",
    );
    for (const path of ["/api/products", "/api/products/1"]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /Database is not enabled/);
    }
    assert.equal((await fetch(base + "/missing")).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("inventory keeps zero stock, converts numeric prices, groups products and binds IDs separately", async (t) => {
  const previousUrl = process.env.DATABASE_URL;
  const previousEnabled = process.env.ENABLE_DATABASE;
  process.env.ENABLE_DATABASE = "true";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  const product = {
    productId: "p1",
    merchantId: "m1",
    categoryId: "electronics",
    name: "Test",
    description: "",
    active: true,
  };
  const id = "p1' OR 1=1 --";
  // Replace only the driver call: this test never connects to PostgreSQL.
  t.mock.method(
    Pool.prototype,
    "query",
    async (sql: string, parameters: unknown[]) => {
      assert(!sql.includes(id));
      assert.deepEqual(parameters, [id]);
      return {
        rows: [
          {
            ...product,
            variantId: "v1",
            variantName: "Black",
            variantStatus: "active",
            sku: "A",
            price: "990.50",
            stockQuantity: 0,
          },
          {
            ...product,
            variantId: "v2",
            variantName: "White",
            variantStatus: "active",
            sku: "B",
            price: "1000.00",
            stockQuantity: 2,
          },
          {
            ...product,
            productId: "p2",
            variantId: null,
            variantName: null,
            variantStatus: null,
            sku: null,
            price: null,
            stockQuantity: null,
          },
        ],
      };
    },
  );
  try {
    const inventory = await getInventory(id);
    assert.equal(inventory.products.length, 2);
    assert.equal(inventory.variants.length, 2);
    assert.equal(inventory.variants[0].stockQuantity, 0);
    assert.equal(inventory.variants[0].price, 990.5);
    assert.equal(inventory.variants[1].stockQuantity, 2);
    assert(!("variantId" in inventory.products[0]));
  } finally {
    await disconnectDatabase();
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    if (previousEnabled === undefined) delete process.env.ENABLE_DATABASE;
    else process.env.ENABLE_DATABASE = previousEnabled;
  }
});
