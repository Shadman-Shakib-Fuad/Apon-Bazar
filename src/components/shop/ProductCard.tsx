"use client";

import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, Heart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import type { ProductView } from "@/types";
import { formatPrice, priceDiff } from "@/lib/utils";

export default function ProductCard({ product }: { product: ProductView }) {
  const { addItem } = useCart();
  const { ids, toggle } = useWishlist();
  const wished = ids.includes(product.id);
  const diff = priceDiff(product.price, product.yesterdayPrice);
  const restricted = product.shopStatus === "restricted";
  const out = product.stock === 0;

  return (
    <div className="group relative rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.id}`}>
        <div className="flex h-32 items-center justify-center rounded-xl bg-primary-light text-6xl">
          {product.emoji}
        </div>
      </Link>

      <button
        onClick={() => toggle(product.id)}
        aria-label="Wishlist"
        className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110"
      >
        <Heart size={16} className={wished ? "fill-red-500 text-red-500" : "text-gray-500"} />
      </button>

      <div className="mt-3">
        <p className="text-base font-bold text-gray-900">
          {formatPrice(product.price)}
          <span className="ml-1 text-xs font-normal text-gray-500">{product.unit}</span>
        </p>

        <Link
          href={`/products/${product.id}`}
          className="mt-0.5 block truncate text-sm font-medium text-gray-800 hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="truncate text-xs text-gray-500">{product.shopName}</p>

        <div className="mt-2 flex items-center gap-1 text-xs">
          {diff > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600">
              <TrendingUp size={12} /> +{formatPrice(diff)}
            </span>
          )}
          {diff < 0 && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700">
              <TrendingDown size={12} /> -{formatPrice(Math.abs(diff))}
            </span>
          )}
          {diff === 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">Same as yesterday</span>
          )}
        </div>
      </div>

      {restricted || out ? (
        <span className="absolute right-5 top-5 rounded-full bg-gray-800/80 px-2 py-0.5 text-[11px] font-medium text-white">
          {restricted ? "Shop restricted" : "Out of stock"}
        </span>
      ) : (
        <button
          onClick={() =>
            addItem({
              productId: product.id,
              shopId: product.shopId,
              shopName: product.shopName,
              shopEmoji: product.shopEmoji,
              deliveryCharge: product.deliveryCharge,
              name: product.name,
              price: product.price,
              emoji: product.emoji,
              unit: product.unit,
            })
          }
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow transition hover:bg-primary-dark active:scale-90"
          aria-label="Add to cart"
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  );
}