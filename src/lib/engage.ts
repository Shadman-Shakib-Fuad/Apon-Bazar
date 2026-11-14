import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Notification from "@/models/Notification";
import Product, { ProductDoc } from "@/models/Product";
import { toProduct, shopMap } from "@/lib/data";
import type { ProductView } from "@/types";

export type NotificationView = {
  id: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export async function getWishlistIds(userId: string): Promise<string[]> {
  if (!mongoose.isValidObjectId(userId)) return [];
  await connectDB();
  const rows = await Wishlist.find({ userId }).lean<{ productId: mongoose.Types.ObjectId }[]>();
  return rows.map((r) => r.productId.toString());
}

export async function getWishlistProducts(userId: string): Promise<ProductView[]> {
  if (!mongoose.isValidObjectId(userId)) return [];
  await connectDB();

  const rows = await Wishlist.find({ userId })
    .sort({ createdAt: -1 })
    .lean<{ productId: mongoose.Types.ObjectId }[]>();

  const [products, shops] = await Promise.all([
    Product.find({ _id: { $in: rows.map((r) => r.productId) } })
      .select("-costPrice")
      .lean<ProductDoc[]>(),
    shopMap(),
  ]);

  const pmap = new Map(products.map((p) => [p._id.toString(), p]));
  const result: ProductView[] = [];
  for (const r of rows) {
    const p = pmap.get(r.productId.toString());
    if (p) result.push(toProduct(p, shops));
  }
  return result;
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!mongoose.isValidObjectId(userId)) return 0;
  await connectDB();
  return Notification.countDocuments({ userId, read: false });
}

export async function getNotifications(userId: string): Promise<NotificationView[]> {
  if (!mongoose.isValidObjectId(userId)) return [];
  await connectDB();
  const rows = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        title: string;
        message: string;
        link?: string;
        read: boolean;
        createdAt: Date;
      }[]
    >();
  return rows.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    link: n.link ?? "",
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}