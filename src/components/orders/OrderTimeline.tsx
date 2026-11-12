"use client";

import { Check, X, Package, CalendarDays } from "lucide-react";
import { ORDER_STEPS } from "@/lib/orders";
import type { OrderView as Order } from "@/types";

const descriptions = [
  "We have received your order",
  "The shop has confirmed your order",
  "Your order is being packed",
  "Your order is on the way",
  "Your order has been delivered",
];

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderTimeline({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const estimated = new Date(order.createdAt);
  estimated.setDate(estimated.getDate() + 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-500 hover:text-gray-900">
          <X size={22} />
        </button>

        <h2 className="text-xl font-extrabold text-gray-900">Track order #{order.code}</h2>
        <p className="mt-1 text-sm text-gray-500">{order.shopName}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-green-100 p-3">
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <Package size={14} className="text-primary" /> Status
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">{ORDER_STEPS[order.statusIndex]}</p>
          </div>
          <div className="rounded-2xl bg-sky-100 p-3">
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <CalendarDays size={14} className="text-sky-600" /> Estimated delivery
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {estimated.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <h3 className="mb-3 mt-6 font-bold text-gray-900">Tracking details</h3>
        <div>
          {ORDER_STEPS.map((step, i) => {
            const done = i <= order.statusIndex;
            const last = i === ORDER_STEPS.length - 1;
            return (
              <div key={step} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                      done ? "border-green-500 bg-green-500 text-white" : "border-gray-300 text-transparent"
                    }`}
                  >
                    <Check size={14} />
                  </div>
                  {!last && (
                    <div className={`w-0.5 flex-1 ${i < order.statusIndex ? "bg-green-500" : "bg-gray-200"}`} style={{ minHeight: 36 }} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between">
                    <p className={`font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>{step}</p>
                    <p className="text-xs text-gray-500">{order.history[i] ? fmt(order.history[i]) : ""}</p>
                  </div>
                  <p className="text-xs text-gray-500">{descriptions[i]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}