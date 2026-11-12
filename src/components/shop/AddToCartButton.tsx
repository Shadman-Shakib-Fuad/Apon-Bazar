"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Product, shops } from "@/data/mock";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const shop = shops.find((s) => s.id === product.shopId);
  const unavailable = product.stock === 0 || shop?.status === "restricted";

  function handleAdd() {
    addItem({
      productId: product.id,
      shopId: product.shopId,
      shopName: shop?.name ?? "",
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      unit: product.unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={unavailable}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
    >
      {added ? <Check size={20} /> : <ShoppingCart size={20} />}
      {unavailable ? "Unavailable" : added ? "Added!" : "Add to cart"}
    </button>
  );
}