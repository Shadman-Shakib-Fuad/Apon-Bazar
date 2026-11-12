"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { Order, ORDER_STEPS, getOrders, saveOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

const badge = [
  "bg-gray-100 text-gray-700",
  "bg-blue-50 text-blue-700",
  "bg-amber-50 text-amber-700",
  "bg-orange-50 text-orange-700",
  "bg-green-50 text-green-700",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tracking, setTracking] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  // Demo button: pore seller panel theke status update hobe
  function advance(id: string) {
    const updated = orders.map((o) =>
      o.id === id && o.statusIndex < ORDER_STEPS.length - 1
        ? { ...o, statusIndex: o.statusIndex + 1, history: [...o.history, new Date().toISOString()] }
        : o
    );
    setOrders(updated);
    saveOrders(updated);
  }

  const trackedOrder = orders.find((o) => o.id === tracking);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>

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
          {orders.map((o) => (
            <div key={o.id} className="rounded-3xl border border-black/5 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">Order #{o.id}</p>
                  <p className="text-xs text-gray-500">
                    {o.shopName} · {new Date(o.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[o.statusIndex]}`}>
                  {ORDER_STEPS[o.statusIndex]}
                </span>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => advance(o.id)}
                    disabled={o.statusIndex === ORDER_STEPS.length - 1}
                    className="rounded-full border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Demo: next status
                  </button>
                  <button
                    onClick={() => setTracking(o.id)}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Track order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {trackedOrder && <OrderTimeline order={trackedOrder} onClose={() => setTracking(null)} />}
    </div>
  );
}