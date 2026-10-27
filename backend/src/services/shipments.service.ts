import { transaction } from "../lib/transaction.js";
import { fail, id, text, number } from "../lib/validation.js";
type input = Record<string, any>;
export async function update_shipment(sid: string, body: input) {
  const status = text(body.status, "shipment status", 20).toLowerCase();
  return transaction(async (c) => {
    const found = await c.query(
      "SELECT order_id FROM shipments WHERE shipment_id=$1",
      [sid],
    );
    if (!found.rowCount) fail("shipment not found", 404);
    const oid = found.rows[0].order_id;
    const order = (
      await c.query(
        "SELECT order_status FROM orders WHERE order_id=$1 FOR UPDATE",
        [oid],
      )
    ).rows[0];
    if (["cancelled", "completed"].includes(order.order_status))
      fail("order is already closed", 409);
    const current = (
      await c.query("SELECT * FROM shipments WHERE shipment_id=$1 FOR UPDATE", [
        sid,
      ])
    ).rows[0];
    const states = ["pending", "processing", "shipped", "delivered"];
    if (states.indexOf(status) !== states.indexOf(current.shipment_status) + 1)
      fail("shipment must move to the next status", 409);
    const carrier =
      status === "shipped"
        ? text(body.carrier, "carrier", 100)
        : current.carrier;
    const tracking =
      status === "shipped"
        ? text(body.tracking, "tracking number", 100)
        : current.tracking_number;
    await c.query(
      `UPDATE shipments SET shipment_status=$2::text,carrier=$3,tracking_number=$4,
   shipped_at=CASE WHEN $2::text='shipped' THEN now() ELSE shipped_at END,
   delivered_at=CASE WHEN $2::text='delivered' THEN now() ELSE delivered_at END WHERE shipment_id=$1`,
      [sid, status, carrier, tracking],
    );
    if (status !== "delivered")
      await c.query("UPDATE orders SET order_status=$2 WHERE order_id=$1", [
        oid,
        status === "shipped" ? "shipped" : "processing",
      ]);
  });
}
