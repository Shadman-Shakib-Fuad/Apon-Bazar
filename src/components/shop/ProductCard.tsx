"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, TrendingUp, TrendingDown, Heart, Star } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { useToast } from "@/components/ui/ToastProvider";
import ProductImage from "@/components/shop/ProductImage";
import type { ProductView } from "@/types";
import { formatPrice, priceDiff } from "@/lib/utils";

export default function ProductCard({ product }: { product: ProductView }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { ids, toggle } = useWishlist();
  const toast = useToast();

  const wished = ids.includes(product.id);
  const diff = priceDiff(product.price, product.yesterdayPrice);
  const restricted = product.shopStatus === "restricted";
  const out = product.stock === 0;
  const unavailable = restricted || out;

  const cartItem = {
    productId: product.id,
    shopId: product.shopId,
    shopName: product.shopName,
    shopEmoji: product.shopEmoji,
    deliveryCharge: product.deliveryCharge,
    name: product.name,
    price: product.price,
    emoji: product.emoji,
    imageUrl: product.imageUrl,
    unit: product.unit,
  };

  // Cart e rakhe, shorashori oi shop er checkout e niye jay
  function addToCart() {
    addItem(cartItem);
    toast({
      title: "Added to cart",
      message: product.name,
      href: "/cart",
      hrefLabel: "View cart",
    });
  }

  function buyNow() {
    addItem(cartItem);
    router.push(`/checkout?shop=${product.shopId}`);
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.id}`}>
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-primary-light text-7xl">
          <ProductImage url={product.imageUrl} emoji={product.emoji} alt={product.name} size={400} />
        </div>
      </Link>

      <button
        onClick={() => toggle(product.id)}
        aria-label="Wishlist"
        className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110"
      >
        <Heart size={16} className={wished ? "fill-red-500 text-red-500" : "text-gray-500"} />
      </button>

      {unavailable && (
        <span className="absolute right-5 top-5 rounded-full bg-gray-800/80 px-2 py-0.5 text-[11px] font-medium text-white">
          {restricted ? "Shop restricted" : "Out of stock"}
        </span>
      )}

      <div className="mt-3 flex-1">
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
        <p className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="truncate">{product.shopName}</span>
          {product.shopReviewCount > 0 ? (
            <span className="flex shrink-0 items-center gap-0.5 font-semibold text-gray-700">
              <Star size={12} className="fill-accent text-accent" />
              {product.shopRating}
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-primary-light px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark">
              New
            </span>
          )}
        </p>

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

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={buyNow}
          disabled={unavailable}
          className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Buy now
        </button>
        <button
          onClick={addToCart}
          disabled={unavailable}
          aria-label="Add to cart"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark active:scale-90 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
}