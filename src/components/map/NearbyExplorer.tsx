"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LocateFixed, Loader2, MapPin, Navigation, Star, Truck } from "lucide-react";
import NearbyMap from "@/components/map/NearbyMap";
import PlaceSearch from "@/components/map/PlaceSearch";
import { findNearbyShops } from "@/app/nearby-actions";
import { DEFAULT_CENTER, formatDistance, haversineKm, type LatLng } from "@/lib/geoUtils";
import { formatPrice } from "@/lib/utils";
import type { NearbyShop } from "@/types";

const RADIUS_OPTIONS = [1, 3, 5, 10, 25];

export default function NearbyExplorer() {
  const [center, setCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [label, setLabel] = useState("Dhaka (default)");
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState(5);
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [live, setLive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Customer er location nei
  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setNotice("Your browser does not support location access.");
      return;
    }
    setLocating(true);
    setNotice("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setCenter(p);
        setLabel("Your current location");
        setSelectedId(null);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setNotice(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Search an area above or tap the map to choose a point."
            : "Could not detect your location. Search an area above or tap the map."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  // Page khulleii location chaibe
  useEffect(() => {
    locate();
  }, [locate]);

  // Center ba radius bodlale kache er shop abar khuje ber kori
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    findNearbyShops(center.lat, center.lng, radius).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setShops(res.shops);
        setError("");
      } else {
        setShops([]);
        setError(res.error);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [center, radius]);

  // Live location: customer chollei update hobe (150m er beshi shorle)
  useEffect(() => {
    if (!live) return;
    if (!("geolocation" in navigator)) {
      setLive(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setLabel("Your live location");
        setCenter((c) => (haversineKm(c, p) > 0.15 ? p : c));
      },
      () => {
        setNotice("Live tracking stopped because your location is unavailable.");
        setLive(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [live]);

  function choosePlace(p: { lat: number; lng: number; label: string }) {
    setLive(false);
    setNotice("");
    setSelectedId(null);
    setCenter({ lat: p.lat, lng: p.lng });
    setLabel(p.label.split(",").slice(0, 2).join(","));
  }

  function pickPoint(p: LatLng) {
    setLive(false);
    setNotice("");
    setSelectedId(null);
    setCenter(p);
    setLabel("Selected point on the map");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">Find shops near you</h1>
      <p className="mt-1 text-sm text-gray-500">
        Allow location access to see the closest shops, or search any area to explore shops there.
      </p>

      <div className="mt-5 rounded-2xl border border-black/5 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <button
            onClick={locate}
            disabled={locating}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            Use my location
          </button>

          <PlaceSearch
            placeholder="Search another area (e.g. Dhanmondi, Uttara, Rajshahi)"
            onSelect={choosePlace}
          />

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                Within {r} km
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <p>
            Searching near: <b className="text-gray-700">{label}</b>
          </p>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
              className="h-4 w-4 accent-green-700"
            />
            Live location (follow me)
          </label>
        </div>
      </div>

      {notice && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="isolate h-[420px] overflow-hidden rounded-3xl border border-black/5 lg:h-[640px]">
          <NearbyMap
            center={center}
            userPos={userPos}
            shops={shops}
            radiusKm={radius}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPick={pickPoint}
          />
        </div>

        <aside className="space-y-3 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            {loading && <Loader2 size={14} className="animate-spin text-primary" />}
            {loading
              ? "Searching..."
              : `${shops.length} shop${shops.length === 1 ? "" : "s"} within ${radius} km`}
          </p>

          {!loading && shops.length === 0 && !error && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
              No shops found here. Try a bigger distance or search another area.
            </div>
          )}

          {shops.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`cursor-pointer rounded-2xl border bg-white p-4 transition hover:shadow-md ${
                selectedId === s.id ? "border-primary ring-2 ring-primary/20" : "border-black/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-light text-2xl">
                  {s.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900">{s.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} /> {s.area}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-accent text-accent" />
                      {s.reviewCount > 0 ? s.rating : "New"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={12} /> {formatPrice(s.deliveryCharge)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-primary-light px-2.5 py-1 text-xs font-bold text-primary-dark">
                  {formatDistance(s.distanceKm)}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/shops/${s.id}`}
                  className="flex-1 rounded-full bg-primary py-2 text-center text-xs font-semibold text-white hover:bg-primary-dark"
                >
                  View shop
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-primary-light"
                >
                  <Navigation size={12} /> Directions
                </a>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}