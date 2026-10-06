"use client";
import { Modal } from "@/components/ui/dialog";
import { useStore } from "@/context/store-provider";
import { Review } from "@/types";
import { Star } from "lucide-react";
import { useState } from "react";

export function ReviewForm({
  productId,
  existing,
  onClose,
}: {
  productId: string;
  existing?: Review;
  onClose: () => void;
}) {
  const { saveReview } = useStore();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (rating < 1 || rating > 5) next.rating = "Choose a rating from 1 to 5.";
    if (!comment.trim()) next.comment = "Please write a short review.";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      saveReview({ productId, rating, comment }, existing?.reviewId);
      onClose();
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Could not save review.",
      });
    }
  }
  return (
    <Modal
      title={existing ? "Edit your review" : "Write a review"}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm">Your rating</legend>
          <div className="star-input">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={n + " stars"}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
              >
                <Star fill={n <= rating ? "currentColor" : "none"} size={29} />
              </button>
            ))}
          </div>
          {errors.rating && (
            <small className="field-error">{errors.rating}</small>
          )}
        </fieldset>
        <label className="field">
          Your review
          <textarea
            aria-label="Your review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            aria-invalid={!!errors.comment}
            required
          />
          {errors.comment && (
            <small className="field-error">{errors.comment}</small>
          )}
        </label>
        {errors.submit && (
          <p role="alert" className="field-error">
            {errors.submit}
          </p>
        )}
        <div className="actions mt-5">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button">Submit review</button>
        </div>
      </form>
    </Modal>
  );
}
