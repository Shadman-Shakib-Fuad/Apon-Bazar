"use client";

import { useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

export type PlaceResult = { lat: number; lng: number; label: string };

type NominatimItem = { lat: string; lon: string; display_name: string };

// OpenStreetMap er free place search (Nominatim). Bangladesh er jaygar upor focus kora
export default function PlaceSearch({
  placeholder,
  onSelect,
}: {
  placeholder: string;
  onSelect: (place: PlaceResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);

  async function search(text: string) {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=bd&q=${encodeURIComponent(text)}`,
        { signal: controller.signal, headers: { "Accept-Language": "en" } }
      );
      const data = (await res.json()) as NominatimItem[];
      const list = data.map((d) => ({
        lat: Number(d.lat),
        lng: Number(d.lon),
        label: d.display_name,
      }));
      setResults(list);
      setOpen(true);
      if (list.length === 0) setError("No places found. Try a different name.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Search failed. Please try again.");
    } finally {
      if (abort.current === controller) setLoading(false);
    }
  }

  function onChange(value: string) {
    setQuery(value);
    setError("");
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    // Lekha thamle 0.5 second por khujbe
    timer.current = setTimeout(() => search(value.trim()), 500);
  }

  function pick(place: PlaceResult) {
    setQuery(place.label.split(",").slice(0, 2).join(","));
    setOpen(false);
    setResults([]);
    onSelect(place);
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:border-primary">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Form er bhetore thakleo Enter e form submit hobe na
            if (e.key === "Enter") {
              e.preventDefault();
              if (results[0]) pick(results[0]);
              else if (query.trim().length >= 3) search(query.trim());
            }
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
        />
        {loading && <Loader2 size={16} className="shrink-0 animate-spin text-primary" />}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-black/5 bg-white p-1 shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(r);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-primary-light"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}