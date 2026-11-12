"use client";

import { useState, useTransition, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { placeOrder } from "@/app/actions";
import { addMyOrderId } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export default function CheckoutForm({ shopId }: { shopId: string }) {
  const { items, clearShop } = useCart();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const shopItems = items.filter((i) => i.shopId === shopId);
  const first = shopItems[0];

  if (!first) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center">
        <p className="text-gray-600">Ei shop er jonno cart e kichu nai.</p>
        <Link href="/cart" className="mt-4 inline-block font-semibold text-primary hover:underline">
          Cart e jao
        </Link>
      </div>
    );
  }

  const subtotal = shopItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryCharge = deliveryType === "home" ? first.deliveryCharge : 0;
  const total = subtotal + deliveryCharge;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await placeOrder({
        shopId,
        items: shopItems.map((i) => ({ productId: i.productId, qty: i.qty })),
        deliveryType,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
      });

      if (res.ok) {
        addMyOrderId(res.id);
        clearShop(shopId);
        router.push("/orders");
      } else {
        setError(res.error);
      }
    });
  }

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Delivery details</h2>

        <div className="grid grid-cols-2 gap-3">
          {(["home", "pickup"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setDeliveryType(t)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                deliveryType === t
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {t === "home" ? "🏠 Home delivery" : "🏪 Shop pickup"}
            </button>
          ))}
        </div>

        <input required placeholder="Full name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Phone number" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {deliveryType === "home" && (
          <textarea required placeholder="Full address" rows={3} className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        )}

        <p className="rounded-xl bg-accent-light p-3 text-xs text-gray-600">
          💳 Stripe payment pore add korbo. Ekhon order database e save hobe.
        </p>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="h-fit rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">{first.shopName}</h2>
        <div className="mt-3 space-y-2 text-sm">
          {shopItems.map((i) => (
            <div key={i.productId} className="flex justify-between text-gray-600">
              <span>{i.name} x {i.qty}</span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{formatPrice(deliveryCharge)}</span></div>
          <div className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
        <button
          disabled={pending}
          className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Order hocche..." : "Place order"}
        </button>
      </div>
    </form>
  );
}