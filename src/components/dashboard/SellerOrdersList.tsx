"use client";

import { useState, useTransition } from "react";
import { ClipboardList } from "lucide-react";
import { updateOrderStatus } from "@/app/seller/actions";
import { ORDER_STEPS } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import type { OrderView } from "@/types";

export default function SellerOrdersList({ orders }: { orders: OrderView[] }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function change(id: string, idx: number) {
    setError("");
    startTransition(async () => {
      const res = await updateOrderStatus(id, idx);
      if (!res.ok) setError(res.error);
    });
  }

  if (orders.length === 0) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-12 text-center">
        <ClipboardList size={48} className="mx-auto text-gray-300" />
        <p className="mt-3 text-gray-600">Ekhono kono order nai</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {orders.map((o) => (
        <div key={o.id} className="rounded-3xl border border-black/5 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">Order #{o.code}</p>
              <p className="text-sm text-gray-600">{o.customerName} · {o.phone}</p>
              <p className="text-xs text-gray-500">{o.deliveryType === "home" ? "🏠 " : "🏪 "}{o.address}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-gray-900">{formatPrice(o.total)}</p>
              <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString("en-GB")}</p>
              <p className="text-xs text-gray-400">Payment: {o.paymentStatus}</p>
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
              disabled={pending}
              onChange={(e) => change(o.id, Number(e.target.value))}
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
  );
}