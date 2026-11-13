"use server";

import mongoose from "mongoose";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import Order from "@/models/Order";
import { getSellerShop } from "@/lib/queries";
import { categories } from "@/data/mock";

type Result = { ok: true } | { ok: false; error: string };

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string(),
  unit: z.string().trim().min(1).max(30),
  price: z.number().min(1),
  costPrice: z.number().min(0),
  stock: z.number().int().min(0),
});

function todayRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

async function savePriceToday(productId: unknown, price: number) {
  const { from, to } = todayRange();
  await PriceHistory.findOneAndUpdate(
    { productId, date: { $gte: from, $lt: to } },
    { price, date: new Date() },
    { upsert: true }
  );
}

export async function createProduct(input: unknown): Promise<Result> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Product er tottho thik na." };
  const d = parsed.data;

  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop paoa jayni." };

  await connectDB();
  const product = await Product.create({
    shopId: shop.id,
    name: d.name,
    category: d.category,
    unit: d.unit,
    emoji: categories.find((c) => c.name === d.category)?.emoji ?? "📦",
    price: d.price,
    costPrice: d.costPrice,
    yesterdayPrice: d.price,
    stock: d.stock,
    sold: 0,
  });
  await savePriceToday(product._id, d.price);

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateProduct(
  id: string,
  input: { price: number; costPrice: number; stock: number }
): Promise<Result> {
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Product paoa jayni." };
  const parsed = z
    .object({ price: z.number().min(1), costPrice: z.number().min(0), stock: z.number().int().min(0) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Price, cost price ar stock thik moto dao." };

  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop paoa jayni." };

  await connectDB();
  const product = await Product.findOne({ _id: id, shopId: shop.id });
  if (!product) return { ok: false, error: "Ei product tomar shop er na." };

  // Selling price bodlale purono dam "yesterdayPrice" e jabe ar price history te save hobe
  if (parsed.data.price !== product.price) {
    product.yesterdayPrice = product.price;
    await savePriceToday(product._id, parsed.data.price);
  }
  product.price = parsed.data.price;
  product.costPrice = parsed.data.costPrice;
  product.stock = parsed.data.stock;
  await product.save();

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Product paoa jayni." };
  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop paoa jayni." };

  await connectDB();
  const res = await Product.deleteOne({ _id: id, shopId: shop.id });
  if (res.deletedCount === 0) return { ok: false, error: "Ei product tomar shop er na." };
  await PriceHistory.deleteMany({ productId: id });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateOrderStatus(orderId: string, statusIndex: number): Promise<Result> {
  if (!mongoose.isValidObjectId(orderId) || statusIndex < 0 || statusIndex > 4) {
    return { ok: false, error: "Status thik na." };
  }
  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop paoa jayni." };

  await connectDB();
  const order = await Order.findOne({ _id: orderId, shopId: shop.id });
  if (!order) return { ok: false, error: "Order paoa jayni." };
  if (statusIndex < order.statusIndex) return { ok: false, error: "Pichone jaoa jabe na." };

  const history = [...order.statusHistory];
  while (history.length <= statusIndex) history.push(new Date());

  order.statusIndex = statusIndex;
  order.statusHistory = history;
  if (
    statusIndex === 4 &&
    order.paymentStatus === "unpaid" &&
    order.paymentMethod === "Cash on Delivery"
  ) {
    order.paymentStatus = "paid";
  }
  await order.save();

  revalidatePath("/", "layout");
  return { ok: true };
}