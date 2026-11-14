"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

export async function toggleWishlist(
  productId: string
): Promise<{ ok: true; wished: boolean } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to use your wishlist." };
  if (!mongoose.isValidObjectId(productId)) return { ok: false, error: "Product not found." };

  await connectDB();

  // Age theke thakle remove, na thakle add
  const removed = await Wishlist.findOneAndDelete({ userId: user.id, productId });
  if (removed) {
    revalidatePath("/wishlist");
    return { ok: true, wished: false };
  }

  if (!(await Product.exists({ _id: productId }))) {
    return { ok: false, error: "Product not found." };
  }
  await Wishlist.create({ userId: user.id, productId });
  revalidatePath("/wishlist");
  return { ok: true, wished: true };
}