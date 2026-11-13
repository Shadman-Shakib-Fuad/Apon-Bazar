"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Shop from "@/models/Shop";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().trim().min(3).max(60),
  area: z.string().trim().min(2).max(60),
  emoji: z.string().min(1).max(8),
  deliveryCharge: z.number().min(0).max(500),
});

export async function createShop(input: unknown): Promise<Result> {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") return { ok: false, error: "Shudhu seller shop khulte pare." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Shop er naam, area ar delivery charge thik moto dao." };

  await connectDB();
  if (await Shop.exists({ ownerId: user.id })) {
    return { ok: false, error: "Tomar already ekta shop ache." };
  }

  await Shop.create({ ...parsed.data, ownerId: user.id, ownerName: user.name ?? "Seller" });

  revalidatePath("/", "layout");
  return { ok: true };
}