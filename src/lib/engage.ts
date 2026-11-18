import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Notification from "@/models/Notification";
import Review from "@/models/Review";
import Product, { ProductDoc } from "@/models/Product";
import { toProduct, shopMap } from "@/lib/data";
import type { ProductView, ReviewView } from "@/types";

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
type ReviewRow = {
  _id: mongoose.Types.ObjectId;
  reviewerName: string;
  productName?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
};

function toReviewView(r: ReviewRow): ReviewView {
  return {
    id: r._id.toString(),
    reviewerName: r.reviewerName,
    productName: r.productName,
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt.toISOString(),
  };
}

// Ekta product er review ar gor rating
export async function getProductReviews(productId: string) {
  if (!mongoose.isValidObjectId(productId)) {
    return { average: 0, count: 0, reviews: [] as ReviewView[] };
  }
  await connectDB();

  const [stats, rows] = await Promise.all([
    Review.aggregate<{ avg: number; count: number }>([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    Review.find({ productId }).sort({ createdAt: -1 }).limit(20).lean<ReviewRow[]>(),
  ]);

  return {
    average: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
    count: stats[0]?.count ?? 0,
    reviews: rows.map(toReviewView),
  };
}

// Ekta shop er shob product er shomprotik review
export async function getShopReviews(shopId: string): Promise<ReviewView[]> {
  if (!mongoose.isValidObjectId(shopId)) return [];
  await connectDB();
  const rows = await Review.find({ shopId, productId: { $exists: true } })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean<ReviewRow[]>();
  return rows.map(toReviewView);
}

// Customer kon order e kon product e review diyeche
export async function getReviewedMap(userId: string): Promise<Record<string, string[]>> {
  if (!mongoose.isValidObjectId(userId)) return {};
  await connectDB();
  const rows = await Review.find({ userId, productId: { $exists: true } })
    .select("orderId productId")
    .lean<{ orderId: mongoose.Types.ObjectId; productId: mongoose.Types.ObjectId }[]>();

  const map: Record<string, string[]> = {};
  for (const r of rows) {
    const key = r.orderId.toString();
    (map[key] ??= []).push(r.productId.toString());
  }
  return map;
}