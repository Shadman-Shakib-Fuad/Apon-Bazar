"use client";

import { useEffect, useState, useTransition, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import LocationPicker from "@/components/map/LocationPicker";
import { placeOrder } from "@/app/actions";
import { createCheckoutSession } from "@/app/payment-actions";
import { getDeliveryQuote } from "@/app/delivery-actions";
import type { LatLng } from "@/lib/geoUtils";
import { formatPrice } from "@/lib/utils";
import type { DeliveryQuote } from "@/types";

export default function CheckoutForm({ shopId }: { shopId: string }) {
  const { items, clearShop } = useCart();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [pos, setPos] = useState<LatLng | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoting, setQuoting] = useState(true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const shopItems = items.filter((i) => i.shopId === shopId);
  const first = shopItems[0];
  const hasItems = Boolean(first);

  // Location bodlale (ba delivery type bodlale) delivery charge abar hishab hoy
  useEffect(() => {
    if (!hasItems) return;
    let cancelled = false;
    setQuoting(true);
    const dest = deliveryType === "home" ? pos : null;
    getDeliveryQuote(shopId, dest?.lat, dest?.lng).then((res) => {
      if (cancelled) return;
      setQuote(res);
      setQuoting(false);
    });
    return () => {
      cancelled = true;
    };
  }, [shopId, hasItems, deliveryType, pos]);

  if (!first) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center">
        <p className="text-gray-600">Your cart has no items from this shop.</p>
        <Link href="/cart" className="mt-4 inline-block font-semibold text-primary hover:underline">
          Go to cart
        </Link>
      </div>
    );
  }

  const closed = quote ? !quote.open : false;
  const needsLocation = quote ? (quote.ok ? quote.needsLocation : true) : false;
  const quoteError = quote && !quote.ok ? quote.error : "";
  const quotedCharge = quote && quote.ok ? quote.charge : null;

  const subtotal = shopItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryCharge = deliveryType === "home" ? quotedCharge ?? first.deliveryCharge : 0;
  const total = subtotal + deliveryCharge;

  const homeBlocked =
    deliveryType === "home" && (Boolean(quoteError) || (needsLocation && !pos) || quoting);
  const blocked = closed || homeBlocked;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (blocked) return;

    startTransition(async () => {
      const res = await placeOrder({
        shopId,
        items: shopItems.map((i) => ({ productId: i.productId, qty: i.qty })),
        deliveryType,
        paymentMethod,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        lat: deliveryType === "home" ? pos?.lat : undefined,
        lng: deliveryType === "home" ? pos?.lng : undefined,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      clearShop(shopId);

      if (paymentMethod === "cod") {
        router.push("/orders");
        return;
      }

      const pay = await createCheckoutSession(res.id);
      if (pay.ok) {
        window.location.href = pay.url;
      } else {
        router.push("/orders");
      }
    });
  }

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  const choice = (active: boolean) =>
    `rounded-xl border px-4 py-3 text-sm font-medium ${
      active ? "border-primary bg-primary-light text-primary-dark" : "border-gray-200 text-gray-600"
    }`;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-3xl border border-black/5 bg-white p-6">
        {closed && quote && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            This shop is closed right now. {quote.hours}.
          </p>
        )}

        <h2 className="text-lg font-bold text-gray-900">Delivery details</h2>

        <div className="grid grid-cols-2 gap-3">
          {(["home", "pickup"] as const).map((t) => (
            <button type="button" key={t} onClick={() => setDeliveryType(t)} className={choice(deliveryType === t)}>
              {t === "home" ? "🏠 Home delivery" : "🏪 Shop pickup"}
            </button>
          ))}
        </div>

        <input required placeholder="Full name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Phone number" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {deliveryType === "home" && (
          <textarea required placeholder="Full address" rows={3} className={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        )}

        {deliveryType === "home" && needsLocation && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Delivery location</p>
            <LocationPicker
              value={pos}
              onChange={setPos}
              icon="📍"
              hint="Tap the map or use your current location to mark where we should deliver."
            />
            <div className="mt-3 text-sm">
              {quoting ? (
                <p className="flex items-center gap-2 text-gray-500">
                  <Loader2 size={14} className="animate-spin" /> Calculating delivery charge...
                </p>
              ) : quoteError ? (
                <p className="rounded-xl bg-red-50 p-3 text-red-600">{quoteError}</p>
              ) : pos && quote?.ok && quote.charge !== null ? (
                <p className="rounded-xl bg-green-50 p-3 text-green-700">
                  Distance {quote.distanceKm} km · Delivery charge {formatPrice(quote.charge)}
                </p>
              ) : null}
            </div>
          </div>
        )}

        <h2 className="pt-2 text-lg font-bold text-gray-900">Payment</h2>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setPaymentMethod("stripe")} className={choice(paymentMethod === "stripe")}>
            💳 Pay online (Stripe)
          </button>
          <button type="button" onClick={() => setPaymentMethod("cod")} className={choice(paymentMethod === "cod")}>
            💵 Cash on delivery
          </button>
        </div>
        {paymentMethod === "stripe" && (
          <p className="rounded-xl bg-accent-light p-3 text-xs text-gray-600">
            You will be redirected to the secure Stripe payment page. Test card: <b>4242 4242 4242 4242</b>, any future expiry date, any CVC.
          </p>
        )}

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
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>
              {deliveryType === "home" && needsLocation && quotedCharge === null
                ? "Mark location"
                : formatPrice(deliveryCharge)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
        <button
          disabled={pending || blocked}
          className="mt-5 w-full rounded-full bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {closed
            ? "Shop is closed"
            : pending
            ? "Please wait..."
            : paymentMethod === "stripe"
            ? "Place order & pay"
            : "Place order"}
        </button>
      </div>
    </form>
  );
}