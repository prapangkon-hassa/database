/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser regression test. */
const assert = require("node:assert/strict");

async function verifyInventory(page) {
  const logs = [];
  const errors = [];
  const context = page.context();
  const detail = await context.newPage();
  const merchant = await context.newPage();
  for (const tab of [page, detail, merchant]) tab.on("pageerror", e => errors.push(e.message));
  const base = "http://localhost:3000";
  await page.goto(base);
  await page.locator(".product-card").first().waitFor();
  await page.evaluate(() => localStorage.removeItem("ef-demo-v1"));
  await page.reload();
  const card = page.locator(".product-card").filter({ has: page.getByRole("heading", { name: "Studio Wireless Headphones", exact: true }) });
  await card.waitFor();
  await detail.goto(base + "/products/p1");
  await detail.getByLabel("Select a variant").waitFor();
  await merchant.goto(base + "/merchant/products");
  await merchant.getByRole("button", { name: "Edit Studio Wireless Headphones", exact: true }).waitFor();

  async function editStock(first, second) {
    await merchant.getByRole("button", { name: "Edit Studio Wireless Headphones", exact: true }).click();
    const inputs = merchant.getByLabel("Stock quantity", { exact: true });
    await inputs.nth(0).fill(String(first));
    await inputs.nth(1).fill(String(second));
    await merchant.getByRole("button", { name: "Save changes", exact: true }).click();
    await merchant.getByRole("dialog").waitFor({ state: "hidden" });
  }
  async function availability(expected) {
    await page.waitForFunction(expected => {
      const card = [...document.querySelectorAll(".product-card")].find(e => e.querySelector("h3")?.textContent === "Studio Wireless Headphones");
      return card?.querySelector(".product-price .stock")?.textContent === expected;
    }, expected);
    await detail.waitForFunction(expected => document.querySelector('[aria-label="Product availability"]')?.textContent === expected, expected);
  }

  await editStock(0, 3);
  await availability("In Stock");
  await detail.getByLabel("Select a variant").selectOption("p1-v1");
  assert.equal(await detail.getByLabel("Variant availability").innerText(), "Out of Stock");
  assert(await detail.getByRole("button", { name: "Add to cart", exact: true }).isDisabled());
  await detail.getByLabel("Select a variant").selectOption("p1-v2");
  assert.equal(await detail.getByLabel("Variant availability").innerText(), "3 available");
  assert(await detail.getByRole("button", { name: "Add to cart", exact: true }).isEnabled());
  logs.push("PASS one empty variant keeps product in stock; selected variant has its own availability");

  await editStock(0, 0);
  await availability("Out of Stock");
  assert(await detail.getByRole("button", { name: "Buy now", exact: true }).isDisabled());
  assert((await detail.getByLabel("Select a variant").locator("option").allTextContents()).every(text => text.includes("Out of Stock")));
  for (const tab of [page, detail, merchant]) await tab.reload();
  await availability("Out of Stock");
  await merchant.getByRole("button", { name: "Edit Studio Wireless Headphones", exact: true }).waitFor();
  logs.push("PASS zero stock updates open list/detail/merchant tabs and survives reload");

  await editStock(0, 3);
  await availability("In Stock");
  await detail.getByLabel("Select a variant").selectOption("p1-v2");
  for (let i = 0; i < 2; i++) await detail.getByRole("button", { name: "Increase quantity" }).click();
  await editStock(0, 1);
  await detail.waitForFunction(() => document.querySelector('[aria-label="Variant availability"]')?.textContent === "1 available");
  assert.equal(await detail.locator(".quantity span").innerText(), "1");
  await detail.getByRole("button", { name: "Buy now", exact: true }).click();
  await detail.waitForURL("**/checkout");
  for (const [label, value] of Object.entries({
    "Full name": "Inventory Test", "Email address": "inventory@example.com",
    "Phone number": "0812345678", "Address line": "24 Demo Road",
    District: "Watthana", Province: "Bangkok", "Postal code": "10110",
  })) await detail.getByLabel(label, { exact: true }).fill(value);
  await detail.getByLabel("QR Payment", { exact: false }).check();
  await detail.getByRole("button", { name: "Place order", exact: true }).click();
  await detail.getByRole("link", { name: "View your order" }).waitFor();
  await detail.goto(base + "/products/p1");
  await availability("Out of Stock");
  const row = merchant.getByRole("row").filter({ hasText: "Studio Wireless Headphones" });
  await row.getByText("Out of Stock", { exact: true }).waitFor();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("ef-demo-v1")));
  assert(stored.variants.filter(v => v.productId === "p1").every(v => v.stockQuantity === 0));
  logs.push("PASS live stock reduction clamps quantity; checkout consumes last unit everywhere");

  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Products", exact: true }).click();
  await card.getByRole("link", { name: "View product", exact: true }).click();
  await page.getByLabel("Product availability").waitFor();
  assert.equal(await page.getByLabel("Product availability").innerText(), "Out of Stock");
  await page.getByRole("link", { name: "Back to products", exact: true }).click();
  await card.getByText("Out of Stock", { exact: true }).last().waitFor();
  await page.reload();
  await card.getByText("Out of Stock", { exact: true }).last().waitFor();
  assert.deepEqual(errors, []);
  logs.push("PASS client navigation and reload never revert inventory to defaults; no runtime errors");
  await detail.close();
  await merchant.close();
  return logs;
}

module.exports = verifyInventory;
if (require.main === module) {
  (async () => {
    const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    try {
      const context = await browser.newContext();
      console.log((await verifyInventory(await context.newPage())).join("\n"));
    } finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
