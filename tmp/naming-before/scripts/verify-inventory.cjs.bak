/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser regression test. */
const assert = require("node:assert/strict");
async function verifyInventory(page) {
  const base = process.env.WEB_URL || "http://localhost:3000";
  const api = process.env.API_URL || "http://localhost:4000/api";
  const token = Date.now();
  const name = "Inventory check " + token;
  const response = await page.request.post(api + "/products", {
    data: {
      name,
      description: "Temporary verification",
      merchantId: "1",
      categoryId: "1",
      active: true,
      variants: [
        {
          variantId: "",
          variantName: "Empty",
          sku: "CHECK-A-" + token,
          price: 100,
          stockQuantity: 0,
          status: "active",
        },
        {
          variantId: "",
          variantName: "Available",
          sku: "CHECK-B-" + token,
          price: 100,
          stockQuantity: 2,
          status: "active",
        },
      ],
    },
  });
  assert.equal(response.status(), 201, await response.text());
  const { productId } = await response.json();
  const detail = await page.context().newPage();
  try {
    await page.goto(base + "/#catalog");
    await page
      .getByRole("textbox", { name: "Search products", exact: true })
      .fill(name);
    const card = page.locator(".product-card").filter({ hasText: name });
    await card.getByText("In Stock", { exact: true }).waitFor();
    await detail.goto(base + "/products/" + productId);
    await detail
      .getByLabel("Product availability", { exact: true })
      .getByText("In Stock", { exact: true })
      .waitFor();
    const inventory = await (
      await page.request.get(api + "/products/" + productId)
    ).json();
    const updated = await page.request.put(api + "/products/" + productId, {
      data: {
        ...inventory.products[0],
        variants: inventory.variants.map((v) => ({
          ...v,
          originalStockQuantity: v.stockQuantity,
          stockQuantity: 0,
        })),
      },
    });
    assert.equal(updated.status(), 200);
    await card
      .getByText("Out of Stock", { exact: true })
      .waitFor({ timeout: 15000 });
    await detail
      .getByLabel("Product availability", { exact: true })
      .getByText("Out of Stock", { exact: true })
      .waitFor({ timeout: 15000 });
    await detail.reload();
    await detail
      .getByLabel("Product availability", { exact: true })
      .getByText("Out of Stock", { exact: true })
      .waitFor();
    assert(await detail.getByRole("button", { name: "Buy now" }).isDisabled());
    return "Shared PostgreSQL stock, multi-variant availability, two tabs and reload: passed";
  } finally {
    await detail.close();
    const deleted = await page.request.delete(api + "/products/" + productId);
    assert.equal(deleted.status(), 204);
  }
}
module.exports = { verifyInventory };
