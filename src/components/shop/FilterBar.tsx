"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { categories } from "@/data/mock";
import LiveSearchBox from "@/components/shop/LiveSearchBox";
import { useQueryUpdater } from "@/components/shop/useQueryUpdater";

type Values = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  rating?: string;
  sort?: string;
};

export default function FilterBar({ values }: { values?: Values }) {
  const { update, pending, sp } = useQueryUpdater();

  const [category, setCategory] = useState(values?.category ?? "");
  const [sort, setSort] = useState(values?.sort ?? "");
  const [rating, setRating] = useState(values?.rating ?? "");
  const [min, setMin] = useState(values?.min ?? "");
  const [max, setMax] = useState(values?.max ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const field =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary";

  // Dropdown bodlale sathe sathe update
  function pick(key: string, value: string, set: (v: string) => void) {
    set(value);
    update({ [key]: value || undefined });
  }

  // Dam lekhar por ektu thamle update
  function price(key: "min" | "max", value: string) {
    if (key === "min") setMin(value);
    else setMax(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ [key]: value || undefined }), 450);
  }

  function clearAll() {
    setCategory("");
    setSort("");
    setRating("");
    setMin("");
    setMax("");
    update({
      q: undefined,
      category: undefined,
      sort: undefined,
      rating: undefined,
      min: undefined,
      max: undefined,
    });
  }

  const hasFilter = Boolean(category || sort || rating || min || max || sp.get("q"));

  return (
    <div className="mb-5 grid gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <LiveSearchBox variant="bar" placeholder="Search products..." />

      <select
        value={category}
        onChange={(e) => pick("category", e.target.value, setCategory)}
        className={field}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.emoji} {c.name}
          </option>
        ))}
      </select>

      <select value={sort} onChange={(e) => pick("sort", e.target.value, setSort)} className={field}>
        <option value="">Sort: Default</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>

      <input
        type="number"
        min="0"
        value={min}
        onChange={(e) => price("min", e.target.value)}
        placeholder="Min price (৳)"
        className={field}
      />
      <input
        type="number"
        min="0"
        value={max}
        onChange={(e) => price("max", e.target.value)}
        placeholder="Max price (৳)"
        className={field}
      />

      <select
        value={rating}
        onChange={(e) => pick("rating", e.target.value, setRating)}
        className={field}
      >
        <option value="">Shop rating: Any</option>
        <option value="4.5">4.5+ ⭐</option>
        <option value="4">4+ ⭐</option>
        <option value="3">3+ ⭐</option>
      </select>

      <div className="flex items-center gap-3">
        {hasFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
        {pending && <Loader2 size={18} className="animate-spin text-primary" />}
      </div>
    </div>
  );
}