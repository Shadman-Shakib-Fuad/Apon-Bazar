"use client";

import { useState, useTransition, FormEvent } from "react";
import { Star, X } from "lucide-react";
import { submitProductReview } from "@/app/review-actions";

export default function ReviewModal({
  orderId,
  productId,
  productName,
  onClose,
}: {
  orderId: string;
  productId: string;
  productName: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await submitProductReview({ orderId, productId, rating, comment });
      if (res.ok) onClose();
      else setError(res.error);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-gray-900"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-extrabold text-gray-900">Write a review</h2>
        <p className="mt-1 text-sm text-gray-500">{productName}</p>

        <div className="mt-5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star`}>
              <Star
                size={32}
                className={n <= rating ? "fill-accent text-accent" : "text-gray-300"}
              />
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
        />

        {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <button
          disabled={pending}
          className="mt-4 w-full rounded-full bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </div>
  );
}