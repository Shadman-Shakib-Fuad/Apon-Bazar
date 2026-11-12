"use client";

import { useState, useTransition } from "react";
import { ArrowRight, History } from "lucide-react";
import { handleReport } from "@/app/admin/actions";
import type { ReportView, AdminLogView } from "@/types";

export default function AdminReportsList({
  reports,
  logs,
}: {
  reports: ReportView[];
  logs: AdminLogView[];
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function act(id: string, action: "restrict" | "dismiss") {
    setError("");
    startTransition(async () => {
      const res = await handleReport(id, action);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {reports.length === 0 && <p className="rounded-3xl bg-white p-10 text-center text-gray-400">Kono report nai</p>}
        {reports.map((r) => (
          <div key={r.id} className="rounded-3xl border border-black/5 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
                {r.reporterName} <ArrowRight size={16} className="text-gray-400" /> {r.shopName}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  r.status === "pending"
                    ? "bg-amber-50 text-amber-700"
                    : r.status === "resolved"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {r.status === "pending" ? "Pending" : r.status === "resolved" ? "Shop restricted" : "Dismissed"}
              </span>
            </div>

            <p className="mt-2 text-sm">
              <span className="rounded-full bg-accent-light px-3 py-0.5 text-xs font-semibold text-accent">{r.reason}</span>
              <span className="ml-2 text-xs text-gray-400">{r.date}</span>
            </p>
            {r.description && <p className="mt-2 text-sm text-gray-600">{r.description}</p>}

            {r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button disabled={pending} onClick={() => act(r.id, "restrict")} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60">
                  Restrict shop
                </button>
                <button disabled={pending} onClick={() => act(r.id, "dismiss")} className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-60">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <History size={18} /> Admin action log
        </h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">Ekhono kono action nai</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {logs.map((l) => (
              <li key={l.id}>
                <span className="mr-2 text-xs text-gray-400">
                  {new Date(l.time).toLocaleString("en-GB")}
                </span>
                {l.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}