import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import HeroSlider from "@/components/shop/HeroSlider";
import ProductCard from "@/components/shop/ProductCard";
import FilterBar from "@/components/shop/FilterBar";
import LiveSearchBox from "@/components/shop/LiveSearchBox";
import { searchProducts, getShops } from "@/lib/data";

// Ek page e koyta product dekhabe: 6 row x 4 product = 24
const PAGE_SIZE = 24;

type Sort = "price_asc" | "price_desc" | "newest";

// Seed diye shuffle: ekoi seed dile ekoi order, notun seed dile notun order
function shuffle<T>(items: T[], seed: number) {
  const arr = [...items];
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
    page?: string;
    seed?: string;
  }>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;
  const q = sp.q || undefined;
  const sort = (["price_asc", "price_desc", "newest"].includes(sp.sort ?? "")
    ? sp.sort
    : undefined) as Sort | undefined;

  const [all, shops] = await Promise.all([
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

  // Pagination
  // Sort chhara thakle prottek bar notun random order
  const seed = Number(sp.seed) || Math.floor(Math.random() * 1_000_000_000);
  const ordered = sort ? all : shuffle(all, seed);

  const total = ordered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(Math.floor(num(sp.page) ?? 1), 1), pages);
  const start = (page - 1) * PAGE_SIZE;
  const products = ordered.slice(start, start + PAGE_SIZE);

  // Filter gulo thikiye rekhe onno page e jawar link
  function pageHref(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (!sort) params.set("seed", String(seed));
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}#products` : "/#products";
  }

  const pageBtn =
    "rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50";
  const pageBtnOff =
    "rounded-full border border-gray-100 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-300";

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark">
        <HeroSlider
          images={["/HeaderImage.png", "/HeaderImage2.png", "/HeaderImage3.png"]}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
          <h1 className="text-3xl font-extrabold text-white md:text-5xl">
            Fresh from your local shops
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90 md:text-base">
            Fresh products from local shops in your neighborhood, delivered to your door.
          </p>
          <LiveSearchBox
            variant="hero"
            placeholder="What are you looking for? tomato, fish, milk..."
          />
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

        {/* Products (majhkhane, dui dike soman jayga) */}
        <section id="products" className="mt-10">
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
            <span className="text-sm text-gray-500">
              {total === 0
                ? "0 items"
                : `${start + 1}-${start + products.length} of ${total} items`}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
              No products found 😕 Try fewer filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className={pageBtn}>
                  ← Previous
                </Link>
              ) : (
                <span className={pageBtnOff}>← Previous</span>
              )}
              <span className="text-sm text-gray-600">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={pageHref(page + 1)} className={pageBtn}>
                  Next →
                </Link>
              ) : (
                <span className={pageBtnOff}>Next →</span>
              )}
            </nav>
          )}
        </section>

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