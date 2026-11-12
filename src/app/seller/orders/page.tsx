"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Order, ORDER_STEPS, getOrders, saveOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders().filter((o) => o.shopName === "Rahim Vegetable Store"));
  }, []);

  function setStatus(id: string, idx: number) {
    const all = getOrders().map((o) => {
      if (o.id !== id) return o;
      const history = [...o.history];
      while (history.length <= idx) history.push(new Date().toISOString());
      return { ...o, statusIndex: idx, history };
    });

    saveOrders(all);
    setOrders(all.filter((o) => o.shopName === "Rahim Vegetable Store"));
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
      <p className="text-sm text-gray-500">Shudhu tomar shop (Rahim Vegetable Store) er order dekhabe</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-12 text-center">
          <ClipboardList size={48} className="mx-auto text-gray-300" />
          <p className="mt-3 text-gray-600">Ekhono kono order nai</p>
          <p className="mt-1 text-xs text-gray-400">
            Website e giye Rahim Vegetable Store er product (Tomato, Potato...) order koro, tarpor ekhane dekho.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-3xl border border-black/5 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Order #{o.id}</p>
                  <p className="text-sm text-gray-600">{o.customerName} · {o.phone}</p>
                  <p className="text-xs text-gray-500">
                    {o.deliveryType === "home" ? "🏠 " : "🏪 "}{o.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-gray-900">{formatPrice(o.total)}</p>
                  <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString("en-GB")}</p>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {o.items.map((i) => (
                  <span key={i.productId} className="mr-3">{i.emoji} {i.name} x{i.qty}</span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={o.statusIndex}
                  onChange={(e) => setStatus(o.id, Number(e.target.value))}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {ORDER_STEPS.map((s, i) => (
                    <option key={s} value={i} disabled={i < o.statusIndex}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}