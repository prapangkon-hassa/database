/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node browser verification script. */
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error")
      errors.push(msg.text() + " " + msg.location().url);
  });
  async function go(route) {
    const r = await page.goto("http://localhost:3000" + route);
    assert.equal(r.status(), 200, route);
    await page.waitForTimeout(350);
  }
  async function text(value) {
    await page.getByText(value, { exact: true }).first().waitFor();
  }
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("ef-demo-v1")));
  await go("/");
  await page.locator(".product-card").first().waitFor();
  assert.equal(await page.locator(".product-card").count(), 12);
  await page.screenshot({ path: "qa/desktop-home.png", fullPage: true });
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("headphones");
  assert.equal(await page.locator(".product-card").count(), 1);
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("not-a-product");
  await text("No matches this time");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Clothing", exact: true }).click();
  assert.equal(await page.locator(".product-card").count(), 2);
  console.log("PASS catalog search, category filters, empty state");
  await go("/products/p1");
  await page.getByLabel("Select a variant").selectOption("p1-v2");
  await text("SKU: EF-P1-02");
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await text("Added to your cart");
  await go("/cart");
  assert.equal((await state()).cart[0].variantId, "p1-v2");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  assert.equal((await state()).cart[0].quantity, 2);
  for (let i = 0; i < 10; i++) {
    const plus = page.getByRole("button", { name: "Increase quantity" });
    if (await plus.isEnabled()) await plus.click();
  }
  assert.equal((await state()).cart[0].quantity, 7);
  assert.equal(
    await page.getByRole("button", { name: "Increase quantity" }).isDisabled(),
    true,
  );
  while ((await state()).cart[0].quantity > 1)
    await page.getByRole("button", { name: "Decrease quantity" }).click();
  assert.equal(
    await page.getByRole("button", { name: "Decrease quantity" }).isDisabled(),
    true,
  );
  await page.reload();
  await page.locator(".cart-item").waitFor();
  assert.equal(await page.locator(".cart-item").count(), 1);
  console.log(
    "PASS variants, cart persistence, minimum and stock maximum quantities",
  );
  await page.getByRole("link", { name: "Proceed to checkout" }).click();
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  await text("Full name is required.");
  for (const [label, value] of Object.entries({
    "Full name": "Alex Test",
    "Email address": "alex@example.com",
    "Phone number": "0812345678",
    "Address line": "24 Demo Road",
    District: "Watthana",
    Province: "Bangkok",
    "Postal code": "10110",
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("QR Payment", { exact: false }).check();
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  await page.getByRole("link", { name: "View your order" }).waitFor();
  const after = await state();
  const created = after.orders[0];
  assert.equal(after.cart.length, 0);
  assert.equal(created.items[0].unitPrice, 2590);
  assert.equal(created.payment.paymentStatus, "Pending");
  assert.equal(
    after.variants.find((v) => v.variantId === "p1-v2").stockQuantity,
    6,
  );
  await page.getByRole("link", { name: "View your order" }).click();
  await text(created.orderId);
  console.log(
    "PASS checkout validation, order creation, snapshot price, stock deduction, order detail",
  );
  await go("/orders/EF-2026-1003");
  await page.getByRole("button", { name: "Write review" }).first().click();
  await page.getByRole("button", { name: "Submit review" }).click();
  await text("Choose a rating from 1 to 5.");
  await page.getByRole("button", { name: "5 stars", exact: true }).click();
  await page
    .getByLabel("Your review", { exact: true })
    .fill("A lovely addition to my everyday routine.");
  await page.getByRole("button", { name: "Submit review" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Edit review" }).first().click();
  await page
    .getByLabel("Your review", { exact: true })
    .fill("Updated review: excellent quality.");
  await page.getByRole("button", { name: "Submit review" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(
    (await state()).reviews.some(
      (r) => r.comment === "Updated review: excellent quality.",
    ),
  );
  await go("/products/p3");
  await text("Updated review: excellent quality.");
  await go("/orders/EF-2026-1003");
  await page
    .getByRole("button", { name: "Delete review", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(
    !(await state()).reviews.some(
      (r) => r.comment === "Updated review: excellent quality.",
    ),
  );
  console.log(
    "PASS review validation, create, edit, storefront sync and delete",
  );
  await go("/merchant/products");
  await page.getByRole("button", { name: "Add product", exact: true }).click();
  await page.getByRole("button", { name: "Create product" }).click();
  await text("Product name is required.");
  await page
    .getByLabel("Product name", { exact: true })
    .fill("QA Desk Organizer");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A practical test product.");
  await page.getByLabel("Category", { exact: true }).selectOption("home");
  await page.getByLabel("Variant name", { exact: true }).fill("Natural");
  await page.getByLabel("SKU", { exact: true }).fill("QA-DESK-01");
  await page.getByLabel("Price (THB)", { exact: true }).fill("450");
  await page.getByLabel("Stock quantity", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Add variant", exact: true }).click();
  assert.equal(
    await page.getByLabel("Variant name", { exact: true }).count(),
    2,
  );
  await page.getByRole("button", { name: "Remove variant 2" }).click();
  await page.getByRole("button", { name: "Create product" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page
    .getByRole("button", { name: "Edit QA Desk Organizer", exact: true })
    .click();
  await page
    .getByLabel("Product name", { exact: true })
    .fill("QA Desk Organizer Updated");
  await page.getByLabel("Price (THB)", { exact: true }).fill("500");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await go("/");
  await page.getByRole("textbox", { name: "Search products" }).fill("QA Desk");
  await text("QA Desk Organizer Updated");
  await go("/merchant/products");
  await page
    .getByRole("button", {
      name: "Delete QA Desk Organizer Updated",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  assert(
    (await state()).products.some(
      (p) => p.name === "QA Desk Organizer Updated",
    ),
  );
  await page
    .getByRole("button", {
      name: "Delete QA Desk Organizer Updated",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(
    !(await state()).products.some(
      (p) => p.name === "QA Desk Organizer Updated",
    ),
  );
  console.log(
    "PASS product create, validation, dynamic variants, edit, storefront sync, delete confirmation",
  );
  await go("/merchant/orders");
  await page
    .getByRole("button", { name: "Manage " + created.orderId, exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark as processing", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark as shipped", exact: true })
    .click();
  await text("Carrier is required.");
  await page.getByLabel("Carrier", { exact: true }).fill("Thailand Post");
  await page
    .getByLabel("Tracking number", { exact: true })
    .fill("QA123456789TH");
  await page
    .getByRole("button", { name: "Mark as shipped", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark as delivered", exact: true })
    .click();
  const delivered = (await state()).orders.find(
    (o) => o.orderId === created.orderId,
  );
  assert.equal(delivered.shipments[0].shippingStatus, "Delivered");
  assert.equal(delivered.status, "Pending");
  await page.getByRole("button", { name: "Close dialog" }).click();
  console.log(
    "PASS shipment progression, tracking validation, and independent order status",
  );
  await go("/products/p11");
  assert(
    await page
      .getByRole("button", { name: "Add to cart", exact: true })
      .isDisabled(),
  );
  await go("/products/missing");
  await text("Product not found");
  await go("/orders/missing");
  await text("Order not found");
  await go("/cart");
  await text("Your next favorite is waiting");
  await go("/products/p2");
  await page.getByRole("button", { name: "Buy now", exact: true }).click();
  await page.waitForURL("**/checkout");
  await go("/cart");
  await page
    .getByRole("button", { name: "Remove Everyday Canvas Tote", exact: true })
    .click();
  await text("Your next favorite is waiting");
  console.log("PASS buy now and cart remove");
  await go("/products/p1");
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  const routes = [
    "/",
    "/products/p1",
    "/cart",
    "/checkout",
    "/orders",
    "/orders/EF-2026-1003",
    "/merchant/products",
    "/merchant/orders",
    "/merchant/reports",
  ];
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await go(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert(!overflow, "Overflow " + route + " at " + width);
      if (route === "/" && width === 390)
        await page.screenshot({ path: "qa/mobile-home.png", fullPage: false });
      if (route === "/checkout" && width === 390)
        await page.screenshot({
          path: "qa/mobile-checkout.png",
          fullPage: true,
        });
    }
    console.log("PASS all routes / no horizontal overflow at " + width + "px");
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go("/merchant/reports");
  await page.screenshot({ path: "qa/reports.png", fullPage: true });
  assert.deepEqual(errors, [], "Browser errors");
  console.log("PASS no browser runtime or console errors");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
