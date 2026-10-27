import { transaction } from "../lib/transaction.js";
import { getInventory } from "./products.service.js";
const title = (value: string) => value[0].toUpperCase() + value.slice(1);
export async function getStore() {
  return transaction(async (client) => {
    const inventory = await getInventory(undefined, client);
    const merchants = (
      await client.query(
        'SELECT merchant_id::text AS "merchantId",merchant_name AS "merchantName",email,phone,status FROM merchants ORDER BY merchant_id',
      )
    ).rows;
    const categories = (
      await client.query(
        'SELECT category_id::text AS "categoryId",category_name AS "categoryName",is_active AS "isActive" FROM categories ORDER BY category_id',
      )
    ).rows;
    const customers = (
      await client.query(
        'SELECT customer_id::text AS "customerId",full_name AS "fullName",email,phone FROM customers ORDER BY customer_id',
      )
    ).rows;
    const reviews = (
      await client.query(
        'SELECT review_id::text AS "reviewId",customer_id::text AS "customerId",product_id::text AS "productId",rating,coalesce(review_text,\'\') AS comment,created_at AS "createdAt" FROM reviews',
      )
    ).rows;
    const rawOrders = (
      await client.query(
        "SELECT * FROM orders ORDER BY order_date DESC,order_id DESC",
      )
    ).rows;
    const items = (
      await client.query(`SELECT i.order_item_id::text AS "orderItemId",i.order_id::text AS "orderId",i.variant_id::text AS "variantId",
   p.product_id::text AS "productId",p.merchant_id::text AS "merchantId",p.category_id::text AS "categoryId",
   p.product_name AS "productName",v.variant_name AS "variantName",i.quantity,i.unit_price AS "unitPrice",i.quantity*i.unit_price AS subtotal
   FROM order_items i JOIN product_variants v USING(variant_id) JOIN products p USING(product_id)`)
    ).rows.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    }));
    const payments = (
      await client.query(
        "SELECT * FROM payments ORDER BY (payment_status='paid') DESC,payment_id DESC",
      )
    ).rows;
    const shipments = (
      await client.query("SELECT * FROM shipments ORDER BY shipment_id")
    ).rows;
    const orders = rawOrders.map((o) => {
      const oi = items.filter((i) => i.orderId === o.order_id);
      const ss = shipments
        .filter((s) => s.order_id === o.order_id)
        .map((s) => ({
          shipmentId: s.shipment_id,
          orderId: s.order_id,
          merchantId: s.merchant_id,
          carrier: s.carrier ?? "",
          trackingNumber: s.tracking_number ?? "",
          shippingStatus: title(s.shipment_status),
          shippingCost: Number(s.shipping_cost),
          shippedAt: s.shipped_at,
          deliveredAt: s.delivered_at,
        }));
      const pp = payments
        .filter((p) => p.order_id === o.order_id)
        .map((p) => ({
          paymentId: p.payment_id,
          orderId: p.order_id,
          paymentMethod: p.payment_method,
          paymentStatus: title(p.payment_status),
          amount: Number(p.amount),
          transactionRef: p.transaction_ref,
          paidAt: p.paid_at,
          createdAt: p.created_at,
        }));
      const subtotal = oi.reduce((n, i) => n + i.subtotal, 0),
        shippingFee = ss.reduce((n, s) => n + s.shippingCost, 0);
      return {
        orderId: o.order_id,
        customerId: o.customer_id,
        orderDate: o.order_date,
        status: title(o.order_status),
        discountAmount: Number(o.discount_amount),
        subtotal,
        shippingFee,
        totalAmount: subtotal + shippingFee - Number(o.discount_amount),
        items: oi,
        shipments: ss,
        payment: pp[0],
        payments: pp,
        address: {
          fullName: o.shipping_name,
          phone: o.shipping_phone,
          addressLine: o.shipping_address,
        },
      };
    });
    const report = (
      await client.query(
        "SELECT * FROM vw_merchant_sales_summary ORDER BY merchant_id,category_id",
      )
    ).rows;
    return {
      ...inventory,
      merchants,
      categories,
      customers,
      reviews,
      orders,
      report,
      currentCustomerId: "1",
    };
  }, true);
}
