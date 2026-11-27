"use client";

import { useState, useTransition } from "react";
import { Star, ShieldAlert, ShieldCheck } from "lucide-react";
import { toggleShopStatus, setShopApproval } from "@/app/admin/actions";
import { formatPrice, isUnderReview } from "@/lib/utils";
import type { AdminShopView } from "@/types";

function ApprovalBadge({ approval }: { approval: AdminShopView["approval"] }) {
  if (approval === "approved") {
    return (
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
        ✔ Verified
      </span>
    );
  }
  if (approval === "pending") {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Awaiting approval
      </span>
    );
  }
  if (approval === "rejected") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        Rejected
      </span>
    );
  }
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
      Not verified
    </span>
  );
}

export default function AdminShopsTable({ shops }: { shops: AdminShopView[] }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong");
    });
  }

  const awaiting = shops.filter((s) => s.approval === "pending").length;

  return (
    <div>
      {awaiting > 0 && (
        <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
          {awaiting} shop{awaiting === 1 ? " is" : "s are"} waiting for your approval.
        </p>
      )}
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-5 py-3">Shop</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Pending reports</th>
              <th className="px-5 py-3">Sales</th>
              <th className="px-5 py-3">Approval</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shops.map((s) => (
              <tr key={s.id} className={s.approval === "pending" ? "bg-amber-50/40" : ""}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {s.name}
                  <span className="block text-xs font-normal text-gray-500">Owner: {s.owner}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-accent text-accent" />
                    <b className={s.reviewCount > 0 && s.rating < 3 ? "text-red-600" : ""}>{s.rating}</b>
                    <span className="text-xs text-gray-400">({s.reviewCount})</span>
                  </span>
                </td>
                <td className="px-5 py-3">{s.pendingReports}</td>
                <td className="px-5 py-3">{formatPrice(s.sales)}</td>
                <td className="px-5 py-3">
                  <ApprovalBadge approval={s.approval} />
                </td>
                <td className="px-5 py-3">
                  {s.status === "restricted" ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Restricted</span>
                  ) : isUnderReview(s) ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Under review</span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Active</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {s.approval !== "approved" && (
                      <button
                        disabled={pending}
                        onClick={() => run(() => setShopApproval(s.id, "approved"))}
                        className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 disabled:opacity-60"
                      >
                        Approve
                      </button>
                    )}
                    {s.approval !== "rejected" && s.approval !== "legacy" && (
                      <button
                        disabled={pending}
                        onClick={() => run(() => setShopApproval(s.id, "rejected"))}
                        className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      disabled={pending}
                      onClick={() => run(() => toggleShopStatus(s.id))}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60 ${
                        s.status === "active"
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {s.status === "active" ? (
                        <>
                          <ShieldAlert size={14} /> Restrict
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} /> Unrestrict
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}