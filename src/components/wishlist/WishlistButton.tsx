"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

export default function WishlistButton({ productId }: { productId: string }) {
  const { ids, toggle } = useWishlist();
  const wished = ids.includes(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      className={`flex items-center justify-center gap-2 rounded-full border px-6 py-3 font-semibold transition ${
        wished
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Heart size={20} className={wished ? "fill-red-500 text-red-500" : ""} />
      {wished ? "Saved" : "Wishlist"}
    </button>
  );
}