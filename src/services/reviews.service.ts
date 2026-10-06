// หมวด reviews: mock service ของ frontend; จุดเปลี่ยนเป็น REST API ในอนาคต
import { currentCustomer } from "@/data/mock-customers";
import { uid } from "@/lib/utils";
import { Review, StoreData } from "@/types";

export function saveReview(
  data: StoreData,
  input: Pick<Review, "productId" | "rating" | "comment">,
  id?: string,
): StoreData {
  // TODO POST /api/reviews or PUT /api/reviews/{id}.
  if (
    !data.orders.some(
      (o) =>
        o.customerId === currentCustomer.customerId &&
        o.status === "Completed" &&
        o.items.some((i) => i.productId === input.productId),
    )
  )
    throw new Error("Reviews are available for completed purchases.");
  if (
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5 ||
    !input.comment.trim()
  )
    throw new Error("Choose 1–5 stars and add a comment.");
  const existing = data.reviews.find(
    (r) =>
      r.customerId === currentCustomer.customerId &&
      r.productId === input.productId,
  );
  const review = {
    ...input,
    comment: input.comment.trim(),
    reviewId: existing?.reviewId ?? id ?? uid("r"),
    customerId: currentCustomer.customerId,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  return {
    ...data,
    reviews: [
      ...data.reviews.filter((r) => r.reviewId !== review.reviewId),
      review,
    ],
  };
}

export function deleteReview(data: StoreData, id: string): StoreData {
  // TODO DELETE /api/reviews/{id}; backend must enforce ownership.
  return {
    ...data,
    reviews: data.reviews.filter(
      (r) =>
        !(r.reviewId === id && r.customerId === currentCustomer.customerId),
    ),
  };
}
