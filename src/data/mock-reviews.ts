import { Review } from "@/types";
export const mockReviews: Review[] = Array.from({ length: 15 }, (_, i) => ({
  reviewId: "r" + i,
  customerId: i % 2 ? "c2" : "c3",
  productId: "p" + ((i % 12) + 1),
  rating: i % 3 === 0 ? 4 : 5,
  comment: [
    "Really well made. The quality is lovely and it arrived carefully packed.",
    "Exactly what I was looking for. Simple, useful, and a great everyday purchase.",
    "Good value and a thoughtful design. Would happily recommend.",
  ][i % 3],
  createdAt: "2026-09-" + String(10 + i).padStart(2, "0") + "T08:00:00Z",
}));
