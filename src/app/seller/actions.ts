"use server";

import mongoose from "mongoose";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import Order from "@/models/Order";
import Wishlist from "@/models/Wishlist";
import { getSellerShop, orderCode } from "@/lib/queries";
import { notify, notifyMany } from "@/lib/notify";
import { ORDER_STEPS } from "@/lib/orders";
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
  if (!parsed.success) return { ok: false, error: "Invalid product details." };
  const d = parsed.data;

  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop not found." };

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
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Product not found." };
  const parsed = z
    .object({ price: z.number().min(1), costPrice: z.number().min(0), stock: z.number().int().min(0) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please enter a valid price, cost price and stock." };

  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop not found." };

  await connectDB();
  const product = await Product.findOne({ _id: id, shopId: shop.id });
  if (!product) return { ok: false, error: "This product does not belong to your shop." };

  if (parsed.data.price !== product.price) {
    const oldPrice = product.price;
    product.yesterdayPrice = oldPrice;
    await savePriceToday(product._id, parsed.data.price);

    // Dam kome gele jara wishlist e rekhechhe tader alert
    if (parsed.data.price < oldPrice) {
      const wishes = await Wishlist.find({ productId: product._id }).lean<
        { userId: mongoose.Types.ObjectId }[]
      >();
      await notifyMany(
        wishes.map((w) => w.userId.toString()),
        {
          title: "Price drop 🎉",
          message: `The price of ${product.name} dropped from ৳${oldPrice} to ৳${parsed.data.price}`,
          link: `/products/${product._id}`,
        }
      );
    }
  }

  product.price = parsed.data.price;
  product.costPrice = parsed.data.costPrice;
  product.stock = parsed.data.stock;
  await product.save();

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Product not found." };
  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop not found." };

  await connectDB();
  const res = await Product.deleteOne({ _id: id, shopId: shop.id });
  if (res.deletedCount === 0) return { ok: false, error: "This product does not belong to your shop." };
  await PriceHistory.deleteMany({ productId: id });
  await Wishlist.deleteMany({ productId: id });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateOrderStatus(orderId: string, statusIndex: number): Promise<Result> {
  if (!mongoose.isValidObjectId(orderId) || statusIndex < 0 || statusIndex > 4) {
    return { ok: false, error: "Invalid status." };
  }
  const shop = await getSellerShop();
  if (!shop) return { ok: false, error: "Seller shop not found." };

  await connectDB();
  const order = await Order.findOne({ _id: orderId, shopId: shop.id });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.cancelled) return { ok: false, error: "The status of a cancelled order cannot be changed." };
  if (statusIndex < order.statusIndex) return { ok: false, error: "Status cannot go backwards." };

  const changed = statusIndex !== order.statusIndex;

  const history = [...order.statusHistory];
  while (history.length <= statusIndex) history.push(new Date());

  order.statusIndex = statusIndex;
  order.statusHistory = history;
  // Shudhu Cash on Delivery order delivered hole "paid" hobe, Stripe order er payment Stripe theke ashe
  if (
    statusIndex === 4 &&
    order.paymentStatus === "unpaid" &&
    order.paymentMethod === "Cash on Delivery"
  ) {
    order.paymentStatus = "paid";
  }
  await order.save();

  // Customer ke alert
  if (changed && order.userId) {
    await notify(order.userId.toString(), {
      title: `Order ${ORDER_STEPS[statusIndex]}`,
      message: `Your order #${orderCode(order._id.toString())} is now "${ORDER_STEPS[statusIndex]}".`,
      link: "/orders",
    });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}