"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, RefreshCw, Download, CreditCard } from "lucide-react";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { createCheckoutSession } from "@/app/payment-actions";
import { ORDER_STEPS } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderView } from "@/types";

const badge = [
  "bg-gray-100 text-gray-700",
  "bg-blue-50 text-blue-700",
  "bg-amber-50 text-amber-700",
  "bg-orange-50 text-orange-700",
  "bg-green-50 text-green-700",
];

export default function OrdersList({ orders }: { orders: OrderView[] }) {
  const router = useRouter();
  const [tracking, setTracking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const trackedOrder = orders.find((o) => o.id === tracking);

  function payNow(id: string) {
    setError("");
    startTransition(async () => {
      const res = await createCheckoutSession(id);
      if (res.ok) window.location.href = res.url;
      else setError(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-12 text-center">
          <ClipboardList size={48} className="mx-auto text-gray-300" />
          <p className="mt-3 text-gray-600">Ekhono kono order nai</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-primary hover:underline">
            Shopping shuru koro
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => {
            const needsPayment = o.paymentStatus === "unpaid" && o.paymentMethod.startsWith("Stripe");
            return (
              <div key={o.id} className="rounded-3xl border border-black/5 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">Order #{o.code}</p>
                    <p className="text-xs text-gray-500">
                      {o.shopName} · {new Date(o.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        o.paymentStatus === "paid"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {o.paymentStatus === "paid" ? "Paid" : needsPayment ? "Payment pending" : "Pay on delivery"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[o.statusIndex]}`}>
                      {ORDER_STEPS[o.statusIndex]}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  {o.items.map((i) => (
                    <span key={i.productId} className="mr-3">
                      {i.emoji} {i.name} x{i.qty}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900">Total: {formatPrice(o.total)}</p>
                  <div className="flex flex-wrap gap-2">
                    {needsPayment && (
                      <button
                        disabled={pending}
                        onClick={() => payNow(o.id)}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                      >
                        <CreditCard size={15} /> Pay now
                      </button>
                    )}
                    <a
                      href={`/api/receipt/${o.id}`}
                      className="flex items-center gap-1.5 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
                    >
                      <Download size={15} /> Receipt
                    </a>
                    <button
                      onClick={() => setTracking(o.id)}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      Track order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {trackedOrder && <OrderTimeline order={trackedOrder} onClose={() => setTracking(null)} />}
    </div>
  );
}