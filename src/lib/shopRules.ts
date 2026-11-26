import { haversineKm, type LatLng } from "@/lib/geoUtils";

export type RuleShop = {
  opensAt?: string | null;
  closesAt?: string | null;
  temporarilyClosed?: boolean | null;
  deliveryCharge: number;
  deliveryRadiusKm?: number | null;
  deliveryBaseCharge?: number | null;
  deliveryPerKm?: number | null;
  location?: { coordinates: number[] } | null;
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Ekhon Bangladesh e koyta baje (minute e). Server jekhanei thakuk, Dhaka er shomoy dhore
function dhakaMinutes(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

export function isShopOpen(shop: RuleShop, now: Date = new Date()) {
  if (shop.temporarilyClosed) return false;
  if (!shop.opensAt || !shop.closesAt) return true; // 24 ghonta khola

  const open = toMinutes(shop.opensAt);
  const close = toMinutes(shop.closesAt);
  if (open === close) return true;

  const t = dhakaMinutes(now);
  // Raat 12 ta paar kore khola thakle (jemon 6 PM theke 2 AM) alada hishab
  return open < close ? t >= open && t < close : t >= open || t < close;
}

function format12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function hoursLabel(shop: RuleShop) {
  if (shop.temporarilyClosed) return "Temporarily closed";
  if (!shop.opensAt || !shop.closesAt) return "Open 24 hours";
  return `Open ${format12(shop.opensAt)} - ${format12(shop.closesAt)}`;
}

// Delivery charge = base + (per km x doori), 5 taka er gunitok e round up
export function chargeForDistance(base: number, perKm: number, km: number) {
  if (perKm <= 0) return base;
  return Math.ceil((base + perKm * km) / 5) * 5;
}

// Radius ba per-km charge thakle customer er location lagbe
export function deliveryNeedsLocation(shop: RuleShop) {
  const hasLocation = shop.location?.coordinates?.length === 2;
  return Boolean(hasLocation) && ((shop.deliveryRadiusKm ?? 0) > 0 || (shop.deliveryPerKm ?? 0) > 0);
}

export type DeliveryResult =
  | { ok: true; charge: number; distanceKm?: number }
  | { ok: false; error: string };

export function calcDelivery(shop: RuleShop, dest: LatLng | null): DeliveryResult {
  const base = shop.deliveryBaseCharge ?? shop.deliveryCharge;
  const perKm = shop.deliveryPerKm ?? 0;
  const radius = shop.deliveryRadiusKm ?? 0;
  const coords = shop.location?.coordinates;
  const shopPos = coords && coords.length === 2 ? { lat: coords[1], lng: coords[0] } : null;

  if (deliveryNeedsLocation(shop)) {
    if (!dest || !shopPos) {
      return { ok: false, error: "Please mark your delivery location on the map." };
    }
    const km = haversineKm(shopPos, dest);
    if (radius > 0 && km > radius) {
      return {
        ok: false,
        error: `This shop delivers within ${radius} km only. Your location is ${km.toFixed(1)} km away.`,
      };
    }
    return {
      ok: true,
      charge: chargeForDistance(base, perKm, km),
      distanceKm: Math.round(km * 10) / 10,
    };
  }

  // Purono shop (location/radius nai): ager moto fixed charge
  const km = shopPos && dest ? Math.round(haversineKm(shopPos, dest) * 10) / 10 : undefined;
  return { ok: true, charge: base, distanceKm: km };
}