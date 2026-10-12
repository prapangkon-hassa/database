import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { createApp } from "../src/app.js";
import { disconnectDatabase } from "../src/lib/db.js";

test("PostgreSQL integration: isolated disposable database", async (t) => {
  const original = process.env.DATABASE_URL;
  assert(original, "Configure backend/.env first");
  const admin = new Pool({ connectionString: original });
  const name = "fulfillment_test_" + Date.now();
  await admin.query(`CREATE DATABASE "${name}"`);
  const url = new URL(original);
  url.pathname = "/" + name;
  process.env.DATABASE_URL = url.toString();
  process.env.ENABLE_DATABASE = "true";
  const db = new Pool({ connectionString: url.toString() });
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api`;
  async function request(path: string, method = "GET", body?: unknown) {
    const r = await fetch(base + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: r.status, body: r.status === 204 ? null : await r.json() };
  }
  const input = (variants: string[], quantity = 1) => ({
    fullName: "Database Test",
    phone: "0800000000",
    addressLine: "University Road",
    paymentMethod: "QR Payment",
    couponCode: "",
    items: variants.map((variantId) => ({ variantId, quantity })),
  });
  try {
    for (const file of ["schema.sql", "logic.sql", "data.sql"])
      await db.query(
        await readFile(
          new URL("../../database/" + file, import.meta.url),
          "utf8",
        ),
      );
    await t.test(
      "10 tables, 500+ main rows, 20 supporting rows and 1:N payments",
      async () => {
        assert.equal(
          (
            await db.query(
              "SELECT count(*) FROM pg_tables WHERE schemaname='public'",
            )
          ).rows[0].count,
          "10",
        );
        for (const table of [
          "products",
          "product_variants",
          "customers",
          "orders",
          "order_items",
          "payments",
          "shipments",
          "reviews",
        ]) {
          assert(
            Number(
              (await db.query("SELECT count(*) FROM " + table)).rows[0].count,
            ) >= 500,
            table,
          );
        }
        for (const table of ["merchants", "categories"])
          assert.equal(
            (await db.query("SELECT count(*) FROM " + table)).rows[0].count,
            "20",
          );
        assert.equal(
          (await db.query("SELECT count(*) FROM payments WHERE order_id=1"))
            .rows[0].count,
          "2",
        );
        const store = await request("/store");
        assert.equal(store.status, 200);
        assert.equal(store.body.products.length, 500);
        assert.equal(
          store.body.orders.find((o: any) => o.orderId === "1").payments.length,
          2,
        );
        assert.equal(store.body.products[0].imageUrl, undefined);
      },
    );
    await t.test("all 10 complex queries execute", async () => {
      const results = await db.query(
        await readFile(
          new URL("../../database/queries.sql", import.meta.url),
          "utf8",
        ),
      );
      assert.equal((results as unknown as unknown[]).length, 10);
    });
    await t.test(
      "database constraints prevent invalid stock and duplicate review",
      async () => {
        await assert.rejects(
          db.query(
            "UPDATE product_variants SET stock_quantity=-1 WHERE variant_id=1",
          ),
          { code: "23514" },
        );
        await assert.rejects(
          db.query(
            "INSERT INTO reviews(customer_id,product_id,rating) VALUES(1,1,6)",
          ),
          { code: "23514" },
        );
        await assert.rejects(
          db.query(
            "INSERT INTO reviews(customer_id,product_id,rating) VALUES(1,1,5)",
          ),
          { code: "23505" },
        );
      },
    );
    await t.test(
      "invalid IDs, untrusted origins and malformed carts rejected",
      async () => {
        assert.equal((await request("/products/1%27%20OR%201=1")).status, 400);
        assert.equal(
          (
            await request("/orders/checkout", "POST", {
              ...input(["1"]),
              items: [{ variantId: "1", quantity: 0 }],
            })
          ).status,
          400,
        );
        const r = await fetch(base + "/products", {
          method: "POST",
          headers: {
            Origin: "https://untrusted.example",
            "Content-Type": "application/json",
          },
          body: "{}",
        });
        assert.equal(r.status, 403);
      },
    );
    await t.test(
      "checkout shortage rolls back all stock and creates no order",
      async () => {
        const before = (
          await db.query(
            "SELECT stock_quantity FROM product_variants WHERE variant_id=1",
          )
        ).rows[0].stock_quantity;
        const orders = (await db.query("SELECT count(*) FROM orders")).rows[0]
          .count;
        const result = await request(
          "/orders/checkout",
          "POST",
          input(["1", "3"], 9999),
        );
        assert.equal(result.status, 409);
        assert.equal(
          (
            await db.query(
              "SELECT stock_quantity FROM product_variants WHERE variant_id=1",
            )
          ).rows[0].stock_quantity,
          before,
        );
        assert.equal(
          (await db.query("SELECT count(*) FROM orders")).rows[0].count,
          orders,
        );
      },
    );
    await t.test(
      "late payment failure rolls back inserted order/items/shipments and stock",
      async () => {
        const before = (
          await db.query(
            "SELECT stock_quantity FROM product_variants WHERE variant_id=1",
          )
        ).rows[0].stock_quantity;
        const count = (await db.query("SELECT count(*) FROM orders")).rows[0]
          .count;
        await db.query(
          "CREATE FUNCTION reject_payment() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Simulated payment failure'; END $$; CREATE TRIGGER reject_payment BEFORE INSERT ON payments FOR EACH ROW EXECUTE FUNCTION reject_payment();",
        );
        const r = await request("/orders/checkout", "POST", input(["1"]));
        assert.equal(r.status, 409);
        await db.query(
          "DROP TRIGGER reject_payment ON payments; DROP FUNCTION reject_payment();",
        );
        assert.equal(
          (
            await db.query(
              "SELECT stock_quantity FROM product_variants WHERE variant_id=1",
            )
          ).rows[0].stock_quantity,
          before,
        );
        assert.equal(
          (await db.query("SELECT count(*) FROM orders")).rows[0].count,
          count,
        );
      },
    );
    await t.test(
      "two simultaneous buyers cannot both buy the last unit",
      async () => {
        await db.query(
          "UPDATE product_variants SET stock_quantity=1 WHERE variant_id=2",
        );
        const results = await Promise.all([
          request("/orders/checkout", "POST", input(["2"])),
          request("/orders/checkout", "POST", input(["2"])),
        ]);
        assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
        assert.equal(
          (
            await db.query(
              "SELECT stock_quantity FROM product_variants WHERE variant_id=2",
            )
          ).rows[0].stock_quantity,
          0,
        );
      },
    );
    await t.test(
      "coupon calculated on server, no client totals trusted",
      async () => {
        const r = await request("/orders/checkout", "POST", {
          ...input(["21"], 3),
          couponCode: "STUDENT10",
          totalAmount: 1,
        });
        assert.equal(r.status, 201);
        const o = (
          await db.query("SELECT * FROM orders WHERE order_id=$1", [
            r.body.orderId,
          ])
        ).rows[0];
        const p = (
          await db.query("SELECT amount FROM payments WHERE order_id=$1", [
            r.body.orderId,
          ])
        ).rows[0];
        const subtotal = Number(
          (
            await db.query(
              "SELECT sum(quantity*unit_price) amount FROM order_items WHERE order_id=$1",
              [r.body.orderId],
            )
          ).rows[0].amount,
        );
        assert.equal(Number(o.discount_amount), Math.min(subtotal * 0.1, 200));
        assert(Number(p.amount) > 1);
      },
    );
    await t.test(
      "multi-merchant deliveries complete only after last shipment, including concurrency",
      async () => {
        const r = await request("/orders/checkout", "POST", {
          ...input(["1", "3"]),
          paymentMethod: "Cash on Delivery",
        });
        assert.equal(r.status, 201);
        const ss = (
          await db.query(
            "SELECT shipment_id FROM shipments WHERE order_id=$1",
            [r.body.orderId],
          )
        ).rows;
        assert.equal(ss.length, 2);
        for (const s of ss) {
          assert.equal(
            (
              await request("/shipments/" + s.shipment_id, "PATCH", {
                status: "Processing",
              })
            ).status,
            204,
          );
          assert.equal(
            (
              await request("/shipments/" + s.shipment_id, "PATCH", {
                status: "Shipped",
                carrier: "Test",
                tracking: "TEST-" + s.shipment_id,
              })
            ).status,
            204,
          );
        }
        assert.notEqual(
          (
            await db.query(
              "SELECT order_status FROM orders WHERE order_id=$1",
              [r.body.orderId],
            )
          ).rows[0].order_status,
          "completed",
        );
        const result = await Promise.all(
          ss.map((s) =>
            request("/shipments/" + s.shipment_id, "PATCH", {
              status: "Delivered",
            }),
          ),
        );
        assert(result.every((r) => r.status === 204));
        assert.equal(
          (
            await db.query(
              "SELECT order_status FROM orders WHERE order_id=$1",
              [r.body.orderId],
            )
          ).rows[0].order_status,
          "completed",
        );
        assert.equal(
          (
            await db.query(
              "SELECT payment_status FROM payments WHERE order_id=$1",
              [r.body.orderId],
            )
          ).rows[0].payment_status,
          "paid",
        );
      },
    );
    await t.test(
      "product CRUD, unique SKU, stale stock update rejected, sold deletion restricted",
      async () => {
        const form = {
          name: "API Test",
          merchantId: "1",
          categoryId: "2",
          description: "Test",
          active: true,
          variants: [
            {
              variantId: "",
              variantName: "Standard",
              sku: "API-TEST",
              price: 100,
              stockQuantity: 5,
              status: "active",
            },
          ],
        };
        const created = await request("/products", "POST", form);
        assert.equal(created.status, 201);
        assert.equal((await request("/products", "POST", form)).status, 409);
        const inv = (await request("/products/" + created.body.productId)).body;
        const edit = {
          ...inv.products[0],
          variants: inv.variants.map((v: any) => ({
            ...v,
            originalStockQuantity: v.stockQuantity,
            stockQuantity: 0,
          })),
        };
        assert.equal(
          (await request("/products/" + created.body.productId, "PUT", edit))
            .status,
          200,
        );
        assert.equal(
          (await request("/products/" + created.body.productId, "PUT", edit))
            .status,
          409,
        );
        assert.equal(
          (await request("/products/" + created.body.productId, "DELETE"))
            .status,
          204,
        );
        assert.equal((await request("/products/1", "DELETE")).status, 409);
      },
    );
    await t.test(
      "review CRUD requires completed purchase and preserves customer ownership",
      async () => {
        const created = await request("/reviews", "POST", {
          productId: "2",
          rating: 5,
          comment: "Test",
        });
        assert.equal(created.status, 201);
        assert.equal(
          (
            await request("/reviews/" + created.body.reviewId, "PUT", {
              productId: "2",
              rating: 4,
              comment: "Updated",
            })
          ).status,
          200,
        );
        assert.equal(
          (await request("/reviews/" + created.body.reviewId, "DELETE")).status,
          204,
        );
        assert.equal(
          (
            await request("/reviews", "POST", {
              productId: "500",
              rating: 5,
              comment: "No purchase",
            })
          ).status,
          409,
        );
      },
    );
    await t.test(
      "report sums exactly reconcile, payment retries never multiply sales",
      async () => {
        const report = (
          await db.query(
            "SELECT sum(gross_sales) gross,sum(shipping_fees) freight FROM vw_merchant_sales_summary",
          )
        ).rows[0];
        const actual = (
          await db.query(
            "SELECT sum(i.quantity*i.unit_price) gross FROM order_items i JOIN orders o USING(order_id) WHERE o.order_status<>'cancelled'",
          )
        ).rows[0];
        const freight = (
          await db.query(
            "SELECT sum(s.shipping_cost) freight FROM shipments s JOIN orders o USING(order_id) WHERE o.order_status<>'cancelled'",
          )
        ).rows[0];
        assert.equal(Number(report.gross), Number(actual.gross));
        assert.equal(Number(report.freight), Number(freight.freight));
      },
    );
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDatabase();
    await db.end();
    // Only this test-created name is eligible for cleanup; never the user's database.
    assert(/^fulfillment_test_\d+$/.test(name));
    await admin.query(`DROP DATABASE "${name}"`);
    await admin.end();
    process.env.DATABASE_URL = original;
  }
});
