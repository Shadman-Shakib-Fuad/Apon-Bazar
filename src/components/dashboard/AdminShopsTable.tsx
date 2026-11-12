"use client";

import { useState, useTransition } from "react";
import { Star, ShieldAlert, ShieldCheck } from "lucide-react";
import { toggleShopStatus } from "@/app/admin/actions";
import { formatPrice, isUnderReview } from "@/lib/utils";
import type { AdminShopView } from "@/types";

export default function AdminShopsTable({ shops }: { shops: AdminShopView[] }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setError("");
    startTransition(async () => {
      const res = await toggleShopStatus(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Shop</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Pending reports</th>
              <th className="px-5 py-3">Sales</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shops.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {s.name}
                  <span className="block text-xs font-normal text-gray-500">Owner: {s.owner}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-accent text-accent" />
                    <b className={s.rating < 3 ? "text-red-600" : ""}>{s.rating}</b>
                    <span className="text-xs text-gray-400">({s.reviewCount})</span>
                  </span>
                </td>
                <td className="px-5 py-3">{s.pendingReports}</td>
                <td className="px-5 py-3">{formatPrice(s.sales)}</td>
                <td className="px-5 py-3">
                  {s.status === "restricted" ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Restricted</span>
                  ) : isUnderReview(s) ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Under review</span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Active</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    disabled={pending}
                    onClick={() => toggle(s.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60 ${
                      s.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {s.status === "active" ? <><ShieldAlert size={14} /> Restrict</> : <><ShieldCheck size={14} /> Unrestrict</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}