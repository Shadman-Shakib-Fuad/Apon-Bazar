import { Star } from "lucide-react";
import type { ReviewView } from "@/types";

export default function ReviewList({
  reviews,
  title,
}: {
  reviews: ReviewView[];
  title: string;
}) {
  return (
    <section className="mt-10 rounded-3xl border border-black/5 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-xs text-gray-400">
        Only customers whose order was delivered can write a review.
      </p>

      <div className="mt-4 divide-y divide-gray-100">
        {reviews.length === 0 && <p className="py-2 text-sm text-gray-400">No reviews yet</p>}
        {reviews.map((r) => (
          <div key={r.id} className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{r.reviewerName}</p>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    className={n <= r.rating ? "fill-accent text-accent" : "text-gray-300"}
                  />
                ))}
              </span>
            </div>
            {r.productName && <p className="text-xs text-primary">on {r.productName}</p>}
            {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
            <p className="mt-1 text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}