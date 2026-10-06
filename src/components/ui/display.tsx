import { money } from "@/lib/utils";
import { Star } from "lucide-react";

export function PriceDisplay({ amount }: { amount: number }) {
  return <span>{money(amount)}</span>;
}

export function RatingStars({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  return (
    <span className="rating" aria-label={rating + " out of 5 stars"}>
      <Star size={13} fill="currentColor" />
      <b>{rating ? rating.toFixed(1) : "New"}</b>
      {count !== undefined && <span className="muted">({count})</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={"badge badge-" + status.toLowerCase().replaceAll(" ", "-")}
    >
      {status}
    </span>
  );
}
