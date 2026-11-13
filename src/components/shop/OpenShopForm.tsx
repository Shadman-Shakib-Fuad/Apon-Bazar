"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createShop } from "@/app/(main)/open-shop/actions";

const emojis = ["🏪", "🥬", "🐟", "🥛", "🛒", "🍞", "🍎", "🍗"];

export default function OpenShopForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", area: "", emoji: "🏪", deliveryCharge: "30" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createShop({ ...form, deliveryCharge: Number(form.deliveryCharge) });
      if (res.ok) router.push("/seller");
      else setError(res.error);
    });
  }

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-black/5 bg-white p-6">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Shop icon</p>
        <div className="flex flex-wrap gap-2">
          {emojis.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setForm({ ...form, emoji: e })}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-2xl ${
                form.emoji === e ? "border-primary bg-primary-light" : "border-gray-200"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <input required placeholder="Shop er naam" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required placeholder="Area (jemon: Main Bazar)" className={input} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">Delivery charge (৳)</p>
        <input required type="number" min="0" max="500" className={input} value={form.deliveryCharge} onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })} />
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Shop banachhi..." : "Open my shop"}
      </button>
    </form>
  );
}