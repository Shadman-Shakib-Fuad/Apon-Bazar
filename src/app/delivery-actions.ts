"use server";

import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop, { ShopDoc } from "@/models/Shop";
import { calcDelivery, deliveryNeedsLocation, hoursLabel, isShopOpen } from "@/lib/shopRules";
import type { DeliveryQuote } from "@/types";

export async function getDeliveryQuote(
  shopId: string,
  lat?: number,
  lng?: number
): Promise<DeliveryQuote> {
  if (!mongoose.isValidObjectId(shopId)) {
    return { ok: false, error: "Shop not found.", open: true, hours: "" };
  }

  await connectDB();
  const shop = await Shop.findById(shopId).lean<ShopDoc>();
  if (!shop) return { ok: false, error: "Shop not found.", open: true, hours: "" };

  const open = isShopOpen(shop);
  const hours = hoursLabel(shop);

  const validDest =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;
  const dest = validDest ? { lat: lat as number, lng: lng as number } : null;

  const needsLocation = deliveryNeedsLocation(shop);
  if (needsLocation && !dest) {
    return { ok: true, needsLocation: true, charge: null, open, hours };
  }

  const quote = calcDelivery(shop, dest);
  if (!quote.ok) return { ok: false, error: quote.error, open, hours };

  return {
    ok: true,
    needsLocation,
    charge: quote.charge,
    distanceKm: quote.distanceKm,
    open,
    hours,
  };
}