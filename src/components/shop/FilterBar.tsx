import Link from "next/link";
import { Search } from "lucide-react";
import { categories } from "@/data/mock";

type Values = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  rating?: string;
  sort?: string;
};

export default function FilterBar({ values }: { values: Values }) {
  const field =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary";
  const hasFilter = Object.values(values).some(Boolean);

  return (
    <form
      action="/"
      className="mb-5 grid gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="relative sm:col-span-2">
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
        <input
          name="q"
          defaultValue={values.q}
          placeholder="Product er naam"
          className={`${field} pl-9`}
        />
      </div>

      <select name="category" defaultValue={values.category ?? ""} className={field}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.emoji} {c.name}
          </option>
        ))}
      </select>

      <select name="sort" defaultValue={values.sort ?? ""} className={field}>
        <option value="">Sort: Default</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>

      <input name="min" type="number" min="0" defaultValue={values.min} placeholder="Min price (৳)" className={field} />
      <input name="max" type="number" min="0" defaultValue={values.max} placeholder="Max price (৳)" className={field} />

      <select name="rating" defaultValue={values.rating ?? ""} className={field}>
        <option value="">Shop rating: Any</option>
        <option value="4.5">4.5+ ⭐</option>
        <option value="4">4+ ⭐</option>
        <option value="3">3+ ⭐</option>
      </select>

      <div className="flex gap-2">
        <button className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Apply
        </button>
        {hasFilter && (
          <Link
            href="/"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}