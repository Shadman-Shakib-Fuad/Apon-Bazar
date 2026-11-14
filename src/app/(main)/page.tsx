import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import FilterBar from "@/components/shop/FilterBar";
import { categories } from "@/data/mock";
import { searchProducts, getShops } from "@/lib/data";

type Sort = "price_asc" | "price_desc" | "newest";

function num(v?: string) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    min?: string;
    max?: string;
    rating?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;
  const q = sp.q || undefined;
  const sort = (["price_asc", "price_desc", "newest"].includes(sp.sort ?? "")
    ? sp.sort
    : undefined) as Sort | undefined;

  const [filtered, shops] = await Promise.all([
    searchProducts({
      category,
      q,
      minPrice: num(sp.min),
      maxPrice: num(sp.max),
      minRating: num(sp.rating),
      sort,
    }),
    getShops(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark">
        <Image
          src="/HeaderImage.png"
          alt="Apon Bazar"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
          <h1 className="text-3xl font-extrabold text-white md:text-5xl">
            Fresh from your local shops
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 md:text-base">
            Fresh products from local shops in your neighborhood, delivered to your door.
          </p>
          <form
            action="/"
            className="mx-auto mt-6 flex max-w-xl overflow-hidden rounded-full bg-white shadow-lg"
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="What are you looking for? tomato, fish, milk..."
              className="w-full px-5 py-3 text-sm outline-none"
            />
            <button className="bg-accent px-6 text-sm font-semibold text-white hover:opacity-90">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Banners */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-accent-light p-6">
            <p className="text-xs font-semibold uppercase text-accent">Fresh Today</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">Fresh vegetables, fair prices</h3>
            <p className="mt-1 text-sm text-gray-600">Check updated prices every day.</p>
          </div>
          <div className="rounded-2xl bg-primary-light p-6">
            <p className="text-xs font-semibold uppercase text-primary">Price Watch</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">Compare with the previous day price</h3>
            <p className="mt-1 text-sm text-gray-600">See if prices went up or down at a glance.</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-6">
            <p className="text-xs font-semibold uppercase text-blue-600">Local Shops</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">Shops from your neighborhood</h3>
            <p className="mt-1 text-sm text-gray-600">Pick great shops based on reviews.</p>
          </div>
        </div>

        {/* Categories + products */}
        <div id="products" className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr]">
          <aside className="hidden h-fit rounded-2xl border border-black/5 bg-white p-2 lg:block">
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                !category ? "bg-primary-light text-primary-dark" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">🧺</span> All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.name}
                href={`/?category=${c.name}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  category === c.name
                    ? "bg-primary-light text-primary-dark"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{c.emoji}</span> {c.name}
              </Link>
            ))}
          </aside>

          <section>
            <FilterBar
              values={{
                q,
                category,
                min: sp.min,
                max: sp.max,
                rating: sp.rating,
                sort: sp.sort,
              }}
            />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {category ?? "All Products"}
                {q && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    for &quot;{q}&quot;
                  </span>
                )}
              </h2>
              <span className="text-sm text-gray-500">{filtered.length} items</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
                No products found 😕 Try fewer filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Popular shops */}
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Popular Shops</h2>
            <Link href="/shops" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shops.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                href={`/shops/${s.id}`}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-2xl">
                  {s.emoji}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">{s.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> {s.area}
                </p>
                <p className="mt-2 flex items-center gap-1 text-sm">
                  <Star size={14} className="fill-accent text-accent" />
                  <span className="font-semibold">{s.rating}</span>
                  <span className="text-gray-400">({s.reviewCount})</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}