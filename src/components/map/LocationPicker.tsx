"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { LocateFixed, Loader2 } from "lucide-react";
import PlaceSearch from "@/components/map/PlaceSearch";
import { emojiIcon, loadLeaflet, TILE_ATTRIBUTION, TILE_URL } from "@/lib/leaflet";
import { DEFAULT_CENTER, type LatLng } from "@/lib/geoUtils";

export default function LocationPicker({
  value,
  onChange,
  icon = "🏪",
  hint,
}: {
  value: LatLng | null;
  onChange: (p: LatLng) => void;
  icon?: string;
  hint?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const fromMap = useRef(false);
  const initial = useRef(value);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Map toiri
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    loadLeaflet().then((L) => {
      if (cancelled || !container.current) return;
      const start = initial.current ?? DEFAULT_CENTER;
      map = L.map(container.current).setView([start.lat, start.lng], initial.current ? 16 : 12);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      // Map e tap korle pin oi jaygay jabe
      map.on("click", (e) => {
        fromMap.current = true;
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
      setReady(false);
    };
  }, []);

  // Pin ar map ke value er shathe milano
  useEffect(() => {
    if (!ready || !value) return;
    let cancelled = false;

    loadLeaflet().then((L) => {
      const map = mapRef.current;
      if (cancelled || !map) return;

      if (!markerRef.current) {
        const marker = L.marker([value.lat, value.lng], {
          draggable: true,
          icon: emojiIcon(L, icon, true),
        }).addTo(map);
        marker.on("dragend", () => {
          const p = marker.getLatLng();
          fromMap.current = true;
          onChangeRef.current({ lat: p.lat, lng: p.lng });
        });
        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([value.lat, value.lng]);
      }

      // Nijer tap/drag e map zoom bodlabe na, search ba GPS e oi jaygay jabe
      if (fromMap.current) {
        fromMap.current = false;
      } else {
        map.setView([value.lat, value.lng], Math.max(map.getZoom(), 16), { animate: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ready, value]);

  function getMyLocation() {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Your browser does not support location access.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setError("Could not get your location. Allow location access, or search a place or tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={getMyLocation}
          disabled={locating}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light disabled:opacity-60"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
          Use my current location
        </button>
        <PlaceSearch
          placeholder="Search a place or address"
          onSelect={(p) => onChange({ lat: p.lat, lng: p.lng })}
        />
      </div>

      <div className="isolate h-72 overflow-hidden rounded-2xl border border-gray-200 sm:h-80">
        <div ref={container} className="h-full w-full" />
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {value
          ? `Pin location: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}. Drag the pin or tap the map to adjust it.`
          : (hint ?? "Tap the map or use your current location to place the pin on your exact shop location.")}
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}