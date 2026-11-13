"use server";

import mongoose from "mongoose";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Shop, { ShopDoc } from "@/models/Shop";
import Product, { ProductDoc } from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";
import Report from "@/models/Report";

type Result = { ok: true } | { ok: false; error: string };

const orderSchema = z.object({
  shopId: z.string().min(1),
  items: z
    .array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(50) }))
    .min(1),
  deliveryType: z.enum(["home", "pickup"]),
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().max(250),
});

export async function placeOrder(
  input: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Order korte age login koro." };

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Form er tottho thik na, abar check koro." };
  const d = parsed.data;

  if (d.deliveryType === "home" && d.address.length < 5) {
    return { ok: false, error: "Home delivery er jonno puro address dao." };
  }
  if (
    !mongoose.isValidObjectId(d.shopId) ||
    d.items.some((i) => !mongoose.isValidObjectId(i.productId))
  ) {
    return { ok: false, error: "Cart e purono product ache. Cart khali kore abar try koro." };
  }

  await connectDB();

  const shop = await Shop.findById(d.shopId).lean<ShopDoc>();
  if (!shop) return { ok: false, error: "Shop paoa jayni." };
  if (shop.status === "restricted") {
    return { ok: false, error: "Ei shop ta restricted, order kora jabe na." };
  }

  const products = await Product.find({
    _id: { $in: d.items.map((i) => i.productId) },
    shopId: shop._id,
  }).lean<ProductDoc[]>();
  const pmap = new Map(products.map((p) => [p._id.toString(), p]));

  const lines = [];
  for (const it of d.items) {
    const p = pmap.get(it.productId);
    if (!p) return { ok: false, error: "Ekta product paoa jayni." };
    if (p.stock < it.qty) {
      return { ok: false, error: `${p.name} er stock kom (${p.stock} ta ache).` };
    }
    lines.push({
      productId: p._id,
      name: p.name,
      emoji: p.emoji,
      unit: p.unit,
      price: p.price,
      costPrice: p.costPrice,
      qty: it.qty,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const deliveryCharge = d.deliveryType === "home" ? shop.deliveryCharge : 0;

  const order = await Order.create({
    shopId: shop._id,
    userId: user.id,
    shopName: shop.name,
    items: lines,
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    deliveryType: d.deliveryType,
    customerName: d.customerName,
    phone: d.phone,
    address: d.deliveryType === "home" ? d.address : "Shop pickup",
    statusIndex: 0,
    statusHistory: [new Date()],
    paymentStatus: "unpaid",
  });

  await Product.bulkWrite(
    lines.map((l) => ({
      updateOne: {
        filter: { _id: l.productId },
        update: { $inc: { stock: -l.qty, sold: l.qty } },
      },
    }))
  );

  revalidatePath("/", "layout");
  return { ok: true, id: order._id.toString() };
}

const reviewSchema = z.object({
  shopId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500),
});

export async function submitReview(input: unknown): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Review dite age login koro." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Rating thik moto dao." };
  const d = parsed.data;
  if (!mongoose.isValidObjectId(d.shopId)) return { ok: false, error: "Shop paoa jayni." };

  await connectDB();
  const shop = await Shop.findById(d.shopId).lean<ShopDoc>();
  if (!shop) return { ok: false, error: "Shop paoa jayni." };
  if (shop.ownerId?.toString() === user.id) {
    return { ok: false, error: "Nijer shop e nijer review deoa jabe na." };
  }

  await Review.create({
    shopId: shop._id,
    reviewerName: user.name ?? "Customer",
    rating: d.rating,
    comment: d.comment,
  });

  const count = shop.reviewCount;
  const rating = Math.round(((shop.rating * count + d.rating) / (count + 1)) * 10) / 10;
  await Shop.updateOne({ _id: shop._id }, { rating, reviewCount: count + 1 });

  revalidatePath("/", "layout");
  return { ok: true };
}

const reportSchema = z.object({
  shopId: z.string(),
  reason: z.enum(["Fake product", "Bad behavior", "Wrong price", "Other"]),
  description: z.string().trim().max(500),
});

export async function submitReport(input: unknown): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Report korte age login koro." };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Reason thik moto dao." };
  const d = parsed.data;
  if (!mongoose.isValidObjectId(d.shopId)) return { ok: false, error: "Shop paoa jayni." };

  await connectDB();
  const shop = await Shop.findById(d.shopId).lean<ShopDoc>();
  if (!shop) return { ok: false, error: "Shop paoa jayni." };

  await Report.create({
    shopId: shop._id,
    shopName: shop.name,
    reporterName: user.name ?? "Customer",
    reason: d.reason,
    description: d.description,
  });

  revalidatePath("/admin", "layout");
  return { ok: true };
}