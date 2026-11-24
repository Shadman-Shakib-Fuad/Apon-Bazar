"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getSellerShop } from "@/lib/queries";
import Shop from "@/models/Shop";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function updateShopLocation(input: unknown): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please mark a valid location on the map." };

  // Shudhu nijer shop er location bodlano jay
  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop not found." };

  await connectDB();
  await Shop.updateOne(
    { _id: shop.id },
    { location: { type: "Point" as const, coordinates: [parsed.data.lng, parsed.data.lat] } }
  );

  revalidatePath("/", "layout");
  return { ok: true };
}