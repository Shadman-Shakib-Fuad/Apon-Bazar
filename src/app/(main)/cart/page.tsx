"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { shops } from "@/data/mock";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const shopIds = Array.from(new Set(items.map((i) => i.shopId)));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag size={56} className="mx-auto text-gray-300" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Tomar cart faka</h1>
        <p className="mt-1 text-sm text-gray-500">Kichu product add koro</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          Shopping shuru koro
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">My Cart</h1>
      <p className="mt-1 text-sm text-gray-500">
        Proti shop er order alada, tai proti shop er jonno alada checkout korte hobe.
      </p>

      <div className="mt-6 space-y-6">
        {shopIds.map((shopId) => {
          const shop = shops.find((s) => s.id === shopId);
          const shopItems = items.filter((i) => i.shopId === shopId);
          const subtotal = shopItems.reduce((sum, i) => sum + i.price * i.qty, 0);
          const delivery = shop?.deliveryCharge ?? 0;

          return (
            <div key={shopId} className="rounded-3xl border border-black/5 bg-white p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <span>{shop?.emoji}</span> {shop?.name}
              </h2>

              <div className="mt-4 divide-y divide-gray-100">
                {shopItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-3xl">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="w-20 text-right font-semibold">{formatPrice(item.price * item.qty)}</p>
                    <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span> <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery charge</span> <span>{formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span> <span>{formatPrice(subtotal + delivery)}</span>
                </div>
              </div>

              <Link
                href={`/checkout?shop=${shopId}`}
                className="mt-4 block rounded-full bg-accent py-3 text-center font-semibold text-white hover:opacity-90"
              >
                Checkout ({shop?.name})
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}