"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, RefreshCw } from "lucide-react";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { getOrdersByIds } from "@/app/actions";
import { ORDER_STEPS, getMyOrderIds } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderView } from "@/types";

const badge = [
  "bg-gray-100 text-gray-700",
  "bg-blue-50 text-blue-700",
  "bg-amber-50 text-amber-700",
  "bg-orange-50 text-orange-700",
  "bg-green-50 text-green-700",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const ids = getMyOrderIds();
    setOrders(ids.length ? await getOrdersByIds(ids) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const trackedOrder = orders.find((o) => o.id === tracking);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-gray-400">Loading...</p>
      ) : orders.length === 0 ? (
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
                  <p className="font-bold text-gray-900">Order #{o.code}</p>
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
                <button
                  onClick={() => setTracking(o.id)}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Track order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {trackedOrder && <OrderTimeline order={trackedOrder} onClose={() => setTracking(null)} />}
    </div>
  );
}