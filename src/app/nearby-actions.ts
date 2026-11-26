"use server";

import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import Shop, { ShopDoc } from "@/models/Shop";
import { isShopOpen } from "@/lib/shopRules";
import type { NearbyShop } from "@/types";

const schema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.number().min(0.5).max(100),
});

export async function findNearbyShops(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<{ ok: true; shops: NearbyShop[] } | { ok: false; error: string }> {
  const parsed = schema.safeParse({ lat, lng, radiusKm });
  if (!parsed.success) return { ok: false, error: "Invalid location." };

  await connectDB();
  // Geo index ready ache kina nishchit kori
  await Shop.init();

  // $geoNear: kache theke dure, doori shoho. Restricted shop dekhabe na
  const rows = await Shop.aggregate<ShopDoc & { distanceM: number }>([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [parsed.data.lng, parsed.data.lat] },
        distanceField: "distanceM",
        maxDistance: parsed.data.radiusKm * 1000,
        spherical: true,
        query: { status: "active" },
      },
    },
    { $limit: 50 },
  ]);

  return {
    ok: true,
    shops: rows.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      emoji: s.emoji,
      area: s.area,
      rating: s.rating,
      reviewCount: s.reviewCount,
      deliveryCharge: s.deliveryCharge,
      lat: s.location!.coordinates[1],
      lng: s.location!.coordinates[0],
      distanceKm: s.distanceM / 1000,
      isOpen: isShopOpen(s),
    })),
  };
}