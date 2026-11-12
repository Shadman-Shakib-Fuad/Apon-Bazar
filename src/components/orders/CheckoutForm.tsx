"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { shops } from "@/data/mock";
import { addOrder, Order } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export default function CheckoutForm({ shopId }: { shopId: string }) {
  const { items, clearShop } = useCart();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const shop = shops.find((s) => s.id === shopId);
  const shopItems = items.filter((i) => i.shopId === shopId);

  if (!shop || shopItems.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center">
        <p className="text-gray-600">Ei shop er jonno cart e kichu nai.</p>
        <Link href="/cart" className="mt-4 inline-block font-semibold text-primary hover:underline">
          Cart e jao
        </Link>
      </div>
    );
  }

  if (shop.status === "restricted") {
    return (
      <div className="rounded-3xl bg-red-50 p-10 text-center text-red-700">
        Ei shop ta restricted, order kora jabe na.
      </div>
    );
  }

  const subtotal = shopItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryCharge = deliveryType === "home" ? shop.deliveryCharge : 0;
  const total = subtotal + deliveryCharge;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    const order: Order = {
      id: `AB${Date.now().toString().slice(-6)}`,
      shopId: shop!.id,
      shopName: shop!.name,
      items: shopItems,
      subtotal,
      deliveryCharge,
      total,
      deliveryType,
      customerName: form.name,
      phone: form.phone,
      address: deliveryType === "home" ? form.address : "Shop pickup",
      statusIndex: 0,
      history: [now],
      createdAt: now,
    };
    addOrder(order);
    clearShop(shop!.id);
    router.push("/orders");
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
          💳 Stripe payment pore add korbo. Ekhon demo order hishebe save hobe.
        </p>
      </div>

      <div className="h-fit rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">{shop.name}</h2>
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
        <button className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-white hover:bg-primary-dark">
          Place order
        </button>
      </div>
    </form>
  );
}