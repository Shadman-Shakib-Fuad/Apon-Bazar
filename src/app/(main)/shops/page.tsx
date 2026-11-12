import Link from "next/link";
import { Star, MapPin, Truck } from "lucide-react";
import { getShops } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ShopsPage() {
  const shops = await getShops();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">All Shops</h1>
      <p className="mt-1 text-sm text-gray-500">Tomar paray er local dokan gulo</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((s) => (
          <Link
            key={s.id}
            href={`/shops/${s.id}`}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light text-3xl">
                {s.emoji}
              </div>
              {s.status === "restricted" && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  Restricted
                </span>
              )}
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">{s.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} /> {s.area}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Star size={15} className="fill-accent text-accent" />
                <b>{s.rating}</b>
                <span className="text-gray-400">({s.reviewCount} reviews)</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Truck size={14} /> {formatPrice(s.deliveryCharge)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}