"use client";

import { useState } from "react";
import { ArrowRight, History } from "lucide-react";
import { initialReports, Report } from "@/data/dashboard";

type Log = { time: string; text: string };

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [log, setLog] = useState<Log[]>([]);

  function act(r: Report, action: "restrict" | "dismiss") {
    setReports(
      reports.map((x) =>
        x.id === r.id ? { ...x, status: action === "restrict" ? "resolved" : "dismissed" } : x
      )
    );
    setLog([
      {
        time: new Date().toLocaleTimeString("en-GB"),
        text:
          action === "restrict"
            ? `Admin restricted "${r.shopName}" (report by ${r.reporter})`
            : `Admin dismissed report by ${r.reporter} against "${r.shopName}"`,
      },
      ...log,
    ]);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Reports</h1>
      <p className="text-sm text-gray-500">Ke kake report korlo, sob ekhane</p>

      <div className="mt-6 space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="rounded-3xl border border-black/5 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
                {r.reporter} <ArrowRight size={16} className="text-gray-400" /> {r.shopName}
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
            <p className="mt-2 text-sm text-gray-600">{r.description}</p>

            {r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => act(r, "restrict")} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                  Restrict shop
                </button>
                <button onClick={() => act(r, "dismiss")} className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200">
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
        {log.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">Ekhono kono action nai</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {log.map((l, i) => (
              <li key={i}>
                <span className="mr-2 text-xs text-gray-400">{l.time}</span>
                {l.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}