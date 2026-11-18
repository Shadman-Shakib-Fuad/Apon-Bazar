"use server";

import mongoose from "mongoose";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import Order from "@/models/Order";
import Review from "@/models/Review";
import Shop, { ShopDoc } from "@/models/Shop";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  orderId: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500),
});

export async function submitProductReview(input: unknown): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to write a review." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a rating from 1 to 5." };
  const d = parsed.data;
  if (!mongoose.isValidObjectId(d.orderId) || !mongoose.isValidObjectId(d.productId)) {
    return { ok: false, error: "Order not found." };
  }

  await connectDB();

  const order = await Order.findById(d.orderId);
  if (!order || order.userId?.toString() !== user.id) {
    return { ok: false, error: "Order not found." };
  }
  // Shudhu Delivered (index 4) order er jonno review dewa jay
  if (order.cancelled || order.statusIndex !== 4) {
    return { ok: false, error: "You can review a product after the order is delivered." };
  }

  const item = order.items.find((i) => i.productId.toString() === d.productId);
  if (!item) return { ok: false, error: "This product is not in your order." };

  if (await Review.exists({ userId: user.id, orderId: order._id, productId: d.productId })) {
    return { ok: false, error: "You already reviewed this product." };
  }

  try {
    await Review.create({
      shopId: order.shopId,
      productId: d.productId,
      productName: item.name,
      userId: user.id,
      orderId: order._id,
      reviewerName: user.name ?? "Customer",
      rating: d.rating,
      comment: d.comment,
    });
  } catch {
    return { ok: false, error: "You already reviewed this product." };
  }

  // Shop er rating = oi shop er shob product review er gor
  const [stats] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { shopId: order.shopId, productId: { $exists: true } } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Shop.updateOne(
    { _id: order.shopId },
    {
      rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
      reviewCount: stats?.count ?? 0,
    }
  );

  const shop = await Shop.findById(order.shopId).lean<ShopDoc>();
  if (shop?.ownerId) {
    await notify(shop.ownerId.toString(), {
      title: "New review ⭐",
      message: `${user.name ?? "A customer"} rated ${item.name} ${d.rating}/5`,
      link: `/products/${d.productId}`,
    });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}