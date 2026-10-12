import { transaction } from "../lib/transaction.js";
import { fail, id, text, number } from "../lib/validation.js";
type Input = Record<string, any>;
// Local classroom customer, not a production login.
const customerId = "1";
export async function saveReview(body: Input, rid?: string) {
  const pid = id(body.productId),
    rating = number(body.rating, "rating", 5),
    comment = text(body.comment ?? "", "review", 1000, true);
  if (!Number.isInteger(rating) || rating < 1) fail("Rating must be 1 to 5");
  return transaction(async (c) => {
    const eligible = await c.query(
      `SELECT 1 FROM orders o JOIN order_items i USING(order_id) JOIN product_variants v USING(variant_id)
   WHERE o.customer_id=$1 AND v.product_id=$2 AND o.order_status='completed' LIMIT 1`,
      [customerId, pid],
    );
    if (!eligible.rowCount)
      fail("Complete a purchase before reviewing this product", 409);
    const result = rid
      ? await c.query(
          "UPDATE reviews SET rating=$3,review_text=$4 WHERE review_id=$1 AND customer_id=$2 AND product_id=$5 RETURNING review_id",
          [rid, customerId, rating, comment, pid],
        )
      : await c.query(
          "INSERT INTO reviews(customer_id,product_id,rating,review_text) VALUES($1,$2,$3,$4) RETURNING review_id",
          [customerId, pid, rating, comment],
        );
    if (!result.rowCount) fail("Review not found", 404);
    return { reviewId: result.rows[0].review_id };
  });
}
export async function deleteReview(rid: string) {
  return transaction(async (c) => {
    const r = await c.query(
      "DELETE FROM reviews WHERE review_id=$1 AND customer_id=$2 RETURNING review_id",
      [rid, customerId],
    );
    if (!r.rowCount) fail("Review not found", 404);
  });
}
