"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import {
  emojiIcon,
  loadLeaflet,
  TILE_ATTRIBUTION,
  TILE_URL,
  userIcon,
} from "@/lib/leaflet";
import { formatDistance, haversineKm, type LatLng } from "@/lib/geoUtils";
import type { NearbyShop } from "@/types";

type Props = {
  center: LatLng;
  userPos: LatLng | null;
  shops: NearbyShop[];
  radiusKm: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPick: (p: LatLng) => void;
};

// Marker e click korle ja popup ashbe (textContent diye, tai shop er naam e HTML thakleo nirapod)
function popupContent(shop: NearbyShop) {
  const box = document.createElement("div");
  box.style.minWidth = "170px";

  const title = document.createElement("div");
  title.textContent = `${shop.emoji} ${shop.name}`;
  title.style.fontWeight = "700";
  title.style.fontSize = "14px";

  const meta = document.createElement("div");
  meta.textContent = `${shop.area} · ${formatDistance(shop.distanceKm)} away`;
  meta.style.fontSize = "12px";
  meta.style.color = "#6b7280";
  meta.style.margin = "2px 0";

  const rating = document.createElement("div");
  rating.textContent =
    shop.reviewCount > 0 ? `★ ${shop.rating} (${shop.reviewCount} reviews)` : "New shop";
  rating.style.fontSize = "12px";

  const link = document.createElement("a");
  link.href = `/shops/${shop.id}`;
  link.textContent = "View shop →";
  link.style.color = "#2e7d32";
  link.style.fontWeight = "600";
  link.style.fontSize = "13px";
  link.style.display = "inline-block";
  link.style.marginTop = "4px";

  box.append(title, meta, rating, link);
  return box;
}

export default function NearbyMap({
  center,
  userPos,
  shops,
  radiusKm,
  selectedId,
  onSelect,
  onPick,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  const initial = useRef(center);
  const onSelectRef = useRef(onSelect);
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onPickRef.current = onPick;
  });

  // 1) Map toiri (ekbar)
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    loadLeaflet().then((L) => {
      if (cancelled || !container.current) return;
      map = L.map(container.current).setView([initial.current.lat, initial.current.lng], 13);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      // Map e kothao tap korle oi jaygar kache er shop dekhabe
      map.on("click", (e) => onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setReady(false);
    };
  }, []);

  // 2) Center ba radius bodlale map oi jaygay jabe
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      const map = mapRef.current;
      if (cancelled || !map) return;
      const bounds = L.latLng(center.lat, center.lng).toBounds(radiusKm * 2000);
      map.fitBounds(bounds, { padding: [24, 24], animate: true });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, center.lat, center.lng, radiusKm]);

  // 3) Marker, circle, user dot ankbe
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    loadLeaflet().then((L) => {
      const map = mapRef.current;
      const layer = layerRef.current;
      if (cancelled || !map || !layer) return;

      layer.clearLayers();

      L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: "#2e7d32",
        weight: 1.5,
        fillColor: "#2e7d32",
        fillOpacity: 0.06,
        interactive: false,
      }).addTo(layer);

      // Search kora ba tap kora jaygar pin
      if (!userPos || haversineKm(center, userPos) > 0.05) {
        L.marker([center.lat, center.lng], {
          icon: emojiIcon(L, "📍"),
          interactive: false,
          keyboard: false,
        }).addTo(layer);
      }

      if (userPos) {
        L.marker([userPos.lat, userPos.lng], {
          icon: userIcon(L),
          interactive: false,
          keyboard: false,
        }).addTo(layer);
      }

      shops.forEach((shop) => {
        const marker = L.marker([shop.lat, shop.lng], {
          icon: emojiIcon(L, shop.emoji, shop.id === selectedId),
        }).addTo(layer);
        marker.bindPopup(popupContent(shop));
        marker.on("click", () => onSelectRef.current(shop.id));
        if (shop.id === selectedId) {
          marker.openPopup();
          map.panTo([shop.lat, shop.lng], { animate: true });
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, center, userPos, shops, radiusKm, selectedId]);

  return <div ref={container} className="h-full w-full" />;
}