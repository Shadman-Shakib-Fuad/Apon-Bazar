"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getSellerShop } from "@/lib/queries";
import Shop from "@/models/Shop";

type Result = { ok: true } | { ok: false; error: string };

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  open24h: z.boolean(),
  opensAt: z.string(),
  closesAt: z.string(),
  temporarilyClosed: z.boolean(),
  deliveryRadiusKm: z.number().min(0).max(100),
  deliveryBaseCharge: z.number().min(0).max(1000),
  deliveryPerKm: z.number().min(0).max(200),
});

export async function updateShopSettings(input: unknown): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the values you entered." };
  const d = parsed.data;

  if (!d.open24h && (!timeRe.test(d.opensAt) || !timeRe.test(d.closesAt))) {
    return { ok: false, error: "Please choose valid opening and closing times." };
  }

  // Shudhu nijer shop
  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop not found." };

  await connectDB();
  await Shop.updateOne(
    { _id: shop.id },
    {
      opensAt: d.open24h ? "" : d.opensAt,
      closesAt: d.open24h ? "" : d.closesAt,
      temporarilyClosed: d.temporarilyClosed,
      deliveryRadiusKm: d.deliveryRadiusKm,
      deliveryBaseCharge: d.deliveryBaseCharge,
      deliveryPerKm: d.deliveryPerKm,
      deliveryCharge: d.deliveryBaseCharge,
    }
  );

  revalidatePath("/", "layout");
  return { ok: true };
}