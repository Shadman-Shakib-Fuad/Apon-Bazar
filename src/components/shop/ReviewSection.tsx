"use client";

import { useState, useTransition, FormEvent } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions";
import type { ReviewView } from "@/types";

export default function ReviewSection({
  shopId,
  reviews,
  loggedIn,
}: {
  shopId: string;
  reviews: ReviewView[];
  loggedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitReview({ shopId, rating, comment });
      if (res.ok) {
        setMsg({ ok: true, text: "Review dewar jonno dhonnobad!" });
        setComment("");
        setRating(5);
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <section className="mt-10 rounded-3xl border border-black/5 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Reviews</h2>

      {loggedIn ? (
        <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-2xl bg-cream p-4">
          <p className="text-sm font-semibold text-gray-700">Tomar review dao</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star`}>
                <Star size={26} className={n <= rating ? "fill-accent text-accent" : "text-gray-300"} />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Tomar obhijnota likho (optional)"
            rows={2}
            className={input}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            disabled={pending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? "Pathachhi..." : "Submit review"}
          </button>
          {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
        </form>
      ) : (
        <p className="mt-4 rounded-2xl bg-cream p-4 text-sm text-gray-600">
          Review dite{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            login koro
          </Link>
          .
        </p>
      )}

      <div className="mt-5 divide-y divide-gray-100">
        {reviews.length === 0 && <p className="text-sm text-gray-400">Ekhono kono review nai</p>}
        {reviews.map((r) => (
          <div key={r.id} className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{r.reviewerName}</p>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} className={n <= r.rating ? "fill-accent text-accent" : "text-gray-300"} />
                ))}
              </span>
            </div>
            {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
            <p className="mt-1 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-GB")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}