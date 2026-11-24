"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import LocationPicker from "@/components/map/LocationPicker";
import { updateShopLocation } from "@/app/seller/location-actions";
import type { LatLng } from "@/lib/geoUtils";

export default function ShopLocationForm({ initial }: { initial: LatLng | null }) {
  const [pos, setPos] = useState<LatLng | null>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    if (!pos) {
      setMsg({ ok: false, text: "Please mark your shop location on the map first." });
      return;
    }
    setMsg(null);
    startTransition(async () => {
      const res = await updateShopLocation({ lat: pos.lat, lng: pos.lng });
      setMsg(
        res.ok
          ? { ok: true, text: "Shop location saved. Nearby customers can find you now." }
          : { ok: false, text: res.error }
      );
    });
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6">
      <LocationPicker value={pos} onChange={setPos} />

      {msg && (
        <p
          className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-sm ${
            msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.ok && <CheckCircle2 size={16} />} {msg.text}
        </p>
      )}

      <button
        onClick={save}
        disabled={pending}
        className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save location"}
      </button>
    </div>
  );
}