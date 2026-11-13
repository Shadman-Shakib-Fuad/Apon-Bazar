import { notFound } from "next/navigation";
import { Star, MapPin, Truck, AlertTriangle } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import ReviewSection from "@/components/shop/ReviewSection";
import ReportButton from "@/components/shop/ReportButton";
import { getShop, getProducts } from "@/lib/data";
import { getReviews } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const shop = await getShop(id);
  if (!shop) notFound();

  const [shopProducts, reviews] = await Promise.all([
    getProducts({ shopId: shop.id }),
    getReviews(shop.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-light text-5xl">
          {shop.emoji}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">{shop.name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin size={15} /> {shop.area}
            </span>
            <span className="flex items-center gap-1">
              <Star size={15} className="fill-accent text-accent" />
              <b>{shop.rating}</b> ({shop.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <Truck size={15} /> Delivery {formatPrice(shop.deliveryCharge)}
            </span>
          </div>
          <ReportButton shopId={shop.id} loggedIn={!!user} />
        </div>
      </div>

      {shop.status === "restricted" && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} /> Ei shop ta ekhon restricted, notun order newa jabe na.
        </div>
      )}

      <h2 className="mb-4 mt-8 text-xl font-bold text-gray-900">
        Products ({shopProducts.length})
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {shopProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <ReviewSection shopId={shop.id} reviews={reviews} loggedIn={!!user} />
    </div>
  );
}