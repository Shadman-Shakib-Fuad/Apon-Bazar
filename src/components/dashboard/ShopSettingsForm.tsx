"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { updateShopSettings } from "@/app/seller/settings-actions";
import { chargeForDistance } from "@/lib/shopRules";
import { formatPrice } from "@/lib/utils";

type Initial = {
  hasLocation: boolean;
  opensAt: string;
  closesAt: string;
  temporarilyClosed: boolean;
  deliveryRadiusKm: number;
  deliveryBaseCharge: number;
  deliveryPerKm: number;
};

export default function ShopSettingsForm({ initial }: { initial: Initial }) {
  const [open24h, setOpen24h] = useState(!initial.opensAt || !initial.closesAt);
  const [opensAt, setOpensAt] = useState(initial.opensAt || "08:00");
  const [closesAt, setClosesAt] = useState(initial.closesAt || "22:00");
  const [closedNow, setClosedNow] = useState(initial.temporarilyClosed);
  const [radius, setRadius] = useState(String(initial.deliveryRadiusKm));
  const [base, setBase] = useState(String(initial.deliveryBaseCharge));
  const [perKm, setPerKm] = useState(String(initial.deliveryPerKm));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  const baseN = Number(base) || 0;
  const perKmN = Number(perKm) || 0;
  const radiusN = Number(radius) || 0;

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updateShopSettings({
        open24h,
        opensAt,
        closesAt,
        temporarilyClosed: closedNow,
        deliveryRadiusKm: radiusN,
        deliveryBaseCharge: baseN,
        deliveryPerKm: perKmN,
      });
      setMsg(
        res.ok
          ? { ok: true, text: "Settings saved." }
          : { ok: false, text: res.error }
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* Opening hours */}
      <section className="rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Opening hours</h2>
        <p className="mt-1 text-xs text-gray-500">
          Times are in Bangladesh time. If the closing time is earlier than the opening time, the shop stays open past midnight.
        </p>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={open24h}
            onChange={(e) => setOpen24h(e.target.checked)}
            className="h-4 w-4 accent-green-700"
          />
          Open 24 hours
        </label>

        {!open24h && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Opens at</p>
              <input type="time" className={input} value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Closes at</p>
              <input type="time" className={input} value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
            </div>
          </div>
        )}

        <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <input
            type="checkbox"
            checked={closedNow}
            onChange={(e) => setClosedNow(e.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          Temporarily closed (customers cannot order until you turn this off)
        </label>
      </section>

      {/* Delivery */}
      <section className="rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Delivery</h2>

        {!initial.hasLocation && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Distance-based delivery needs your shop location.{" "}
            <Link href="/seller/location" className="font-semibold underline">
              Set your shop location
            </Link>{" "}
            first. Until then a fixed delivery charge is used.
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Delivery radius (km)</p>
            <input type="number" min="0" max="100" className={input} value={radius} onChange={(e) => setRadius(e.target.value)} />
            <p className="mt-1 text-xs text-gray-400">0 = no limit</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Base charge (৳)</p>
            <input type="number" min="0" className={input} value={base} onChange={(e) => setBase(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Charge per km (৳)</p>
            <input type="number" min="0" className={input} value={perKm} onChange={(e) => setPerKm(e.target.value)} />
            <p className="mt-1 text-xs text-gray-400">0 = same charge for every distance</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-cream p-4 text-sm text-gray-700">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Customer will pay</p>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 5].map((km) => (
              <span key={km} className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm">
                {km} km: {formatPrice(chargeForDistance(baseN, perKmN, km))}
              </span>
            ))}
            {radiusN > 0 && (
              <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
                Max {radiusN} km
              </span>
            )}
          </div>
        </div>
      </section>

      {msg && (
        <p
          className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
            msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.ok && <CheckCircle2 size={16} />} {msg.text}
        </p>
      )}

      <button
        onClick={save}
        disabled={pending}
        className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}