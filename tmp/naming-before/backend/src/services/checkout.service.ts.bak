import { transaction } from "../lib/transaction.js";
import { fail, id, text, number } from "../lib/validation.js";
type Input = Record<string, any>;
// Local classroom customer, not a production login.
const customerId = "1";
export async function checkout(body: Input) {
  const name = text(body.fullName, "shipping name", 150),
    phone = text(body.phone, "phone", 20),
    address = text(body.addressLine, "shipping address", 500);
  const method = text(body.paymentMethod, "payment method", 30),
    coupon = text(body.couponCode ?? "", "coupon", 30, true);
  if (
    !Array.isArray(body.items) ||
    !body.items.length ||
    body.items.length > 100
  )
    fail("Invalid cart");
  const items = body.items.map((i: Input) => {
    const quantity = number(i.quantity, "quantity", 10000);
    if (!Number.isInteger(quantity) || quantity < 1) fail("Invalid quantity");
    return { variantId: id(i.variantId), quantity };
  });
  return transaction(async (c) => {
    const r = await c.query(
      "CALL sp_checkout_order($1,$2::jsonb,$3,$4,$5,$6,$7,NULL)",
      [customerId, JSON.stringify(items), name, phone, address, method, coupon],
    );
    return { orderId: r.rows[0].p_order_id };
  });
}
