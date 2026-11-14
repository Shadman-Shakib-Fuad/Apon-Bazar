import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { getCurrentUser } from "@/lib/session";
import { getWishlistProducts } from "@/lib/engage";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const products = await getWishlistProducts(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">My Wishlist</h1>
      <p className="mt-1 text-sm text-gray-500">
        Ei product gulor dam kome gele tomake notification pathabo.
      </p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-300" />
          <p className="mt-3 text-gray-600">Wishlist faka</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Product dekho
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}