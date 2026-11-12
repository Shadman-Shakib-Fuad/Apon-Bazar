"use client";

import { useState, useTransition, FormEvent } from "react";
import { Flag } from "lucide-react";
import { submitReport } from "@/app/actions";

const reasons = ["Fake product", "Bad behavior", "Wrong price", "Other"] as const;

export default function ReportButton({ shopId }: { shopId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState<(typeof reasons)[number]>("Fake product");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitReport({ shopId, reporterName: name, reason, description });
      if (res.ok) {
        setMsg({ ok: true, text: "Report pathano hoyeche. Admin dekhbe." });
        setName("");
        setDescription("");
        setOpen(false);
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
      >
        <Flag size={14} /> Report this shop
      </button>

      {open && (
        <form onSubmit={onSubmit} className="mt-3 space-y-3 rounded-2xl border border-red-100 bg-white p-4">
          <input required placeholder="Tomar naam" className={input} value={name} onChange={(e) => setName(e.target.value)} />
          <select className={input} value={reason} onChange={(e) => setReason(e.target.value as (typeof reasons)[number])}>
            {reasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <textarea
            placeholder="Ki hoyechhe likho"
            rows={3}
            className={input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            disabled={pending}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Pathachhi..." : "Submit report"}
          </button>
        </form>
      )}
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}