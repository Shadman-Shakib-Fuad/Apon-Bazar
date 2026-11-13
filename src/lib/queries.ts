import { getCurrentUser } from "@/lib/session";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop, { ShopDoc } from "@/models/Shop";
import Product, { ProductDoc } from "@/models/Product";
import Order, { OrderType } from "@/models/Order";
import Review from "@/models/Review";
import Report from "@/models/Report";
import AdminLog from "@/models/AdminLog";
import User from "@/models/User";
import type {
  ShopView,
  OrderView,
  ReviewView,
  SellerProductView,
  AdminShopView,
  ReportView,
  AdminLogView,
} from "@/types";

// Login add korar age seller hishebe ei shop ta dhore nichhi
export const SELLER_SHOP_NAME = "Rahim Vegetable Store";

export type OrderDoc = OrderType & { _id: mongoose.Types.ObjectId; createdAt: Date };

export function orderCode(id: string) {
  return `AB${id.slice(-6).toUpperCase()}`;
}

export function toOrderView(o: OrderDoc): OrderView {
  const id = o._id.toString();
  return {
    id,
    code: orderCode(id),
    userId: o.userId ? o.userId.toString() : "",
    shopId: o.shopId.toString(),
    shopName: o.shopName,
    items: o.items.map((i) => ({
      productId: i.productId.toString(),
      name: i.name,
      emoji: i.emoji ?? "📦",
      unit: i.unit ?? "",
      price: i.price,
      qty: i.qty,
    })),
    subtotal: o.subtotal,
    deliveryCharge: o.deliveryCharge,
    total: o.total,
    deliveryType: o.deliveryType as OrderView["deliveryType"],
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    statusIndex: o.statusIndex,
    history: (o.statusHistory ?? []).map((d) => new Date(d).toISOString()),
    paymentStatus: o.paymentStatus as OrderView["paymentStatus"],
    paymentMethod: o.paymentMethod ?? "Cash on Delivery",
    transactionId: o.transactionId ?? "",
    createdAt: o.createdAt.toISOString(),
  };
}

// ---------------- Seller ----------------
export async function getSellerShop(): Promise<ShopView | null> {
  await connectDB();
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") return null;
  const s = await Shop.findOne({ ownerId: user.id }).lean<ShopDoc>();
  if (!s) return null;
  return {
    id: s._id.toString(),
    name: s.name,
    area: s.area,
    emoji: s.emoji,
    status: s.status as ShopView["status"],
    deliveryCharge: s.deliveryCharge,
    rating: s.rating,
    reviewCount: s.reviewCount,
  };
}

export async function getSellerProducts(shopId: string): Promise<SellerProductView[]> {
  await connectDB();
  const products = await Product.find({ shopId }).sort({ _id: -1 }).lean<ProductDoc[]>();
  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    emoji: p.emoji,
    category: p.category,
    unit: p.unit,
    price: p.price,
    costPrice: p.costPrice,
    stock: p.stock,
  }));
}

export async function getShopOrders(shopId: string): Promise<OrderView[]> {
  await connectDB();
  const orders = await Order.find({ shopId }).sort({ createdAt: -1 }).lean<OrderDoc[]>();
  return orders.map(toOrderView);
}

export async function getSellerDashboard(shopId: string) {
  await connectDB();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const orders = await Order.find({ shopId, createdAt: { $gte: start } }).lean<OrderDoc[]>();

  const daily = Array.from({ length: 7 }, (_, i) => {
    const from = new Date(start);
    from.setDate(start.getDate() + i);
    const to = new Date(from);
    to.setDate(from.getDate() + 1);

    let revenue = 0;
    let cost = 0;
    orders
      .filter((o) => o.createdAt >= from && o.createdAt < to)
      .forEach((o) =>
        o.items.forEach((it) => {
          revenue += it.price * it.qty;
          cost += (it.costPrice ?? 0) * it.qty;
        })
      );

    return {
      day: from.toLocaleDateString("en-US", { weekday: "short" }),
      revenue,
      cost,
      profit: revenue - cost,
    };
  });

  const totals = new Map<string, { name: string; sold: number; revenue: number; profit: number }>();
  orders.forEach((o) =>
    o.items.forEach((it) => {
      const key = it.productId.toString();
      const cur = totals.get(key) ?? { name: it.name, sold: 0, revenue: 0, profit: 0 };
      cur.sold += it.qty;
      cur.revenue += it.price * it.qty;
      cur.profit += (it.price - (it.costPrice ?? 0)) * it.qty;
      totals.set(key, cur);
    })
  );

  const products = await Product.find({ shopId }).lean<ProductDoc[]>();
  const pmap = new Map(products.map((p) => [p._id.toString(), p]));

  const items = Array.from(totals.entries())
    .map(([id, v]) => {
      const p = pmap.get(id);
      return {
        id,
        name: v.name,
        emoji: p?.emoji ?? "📦",
        category: p?.category ?? "Other",
        unit: p?.unit ?? "",
        price: p?.price ?? 0,
        costPrice: p?.costPrice ?? 0,
        sold: v.sold,
        revenue: v.revenue,
        profit: v.profit,
      };
    })
    .sort((a, b) => b.sold - a.sold);

  return { daily, items };
}

// ---------------- Reviews ----------------
export async function getReviews(shopId: string): Promise<ReviewView[]> {
  await connectDB();
  const rows = await Review.find({ shopId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        reviewerName: string;
        rating: number;
        comment?: string;
        createdAt: Date;
      }[]
    >();
  return rows.map((r) => ({
    id: r._id.toString(),
    reviewerName: r.reviewerName,
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt.toISOString(),
  }));
}

// ---------------- Admin ----------------
export async function getAdminOverview() {
  await connectDB();
  const [users, shops, orders, salesAgg, byShop, reportAgg] = await Promise.all([
    User.countDocuments(),
    Shop.countDocuments(),
    Order.countDocuments(),
    Order.aggregate<{ _id: null; total: number }>([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate<{ _id: string; sales: number }>([
      { $group: { _id: "$shopName", sales: { $sum: "$total" } } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]),
    Report.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$shopName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    users,
    shops,
    orders,
    sales: salesAgg[0]?.total ?? 0,
    topShops: byShop.map((x) => ({ name: x._id.split(" ")[0], value: x.sales })),
    mostReported: reportAgg.map((x) => ({ name: x._id, count: x.count })),
  };
}

export async function getAdminShops(): Promise<AdminShopView[]> {
  await connectDB();
  const [shops, pending, sales] = await Promise.all([
    Shop.find().sort({ _id: 1 }).lean<ShopDoc[]>(),
    Report.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { status: "pending" } },
      { $group: { _id: "$shopId", count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: mongoose.Types.ObjectId; sales: number }>([
      { $group: { _id: "$shopId", sales: { $sum: "$total" } } },
    ]),
  ]);

  const pendingMap = new Map(pending.map((p) => [p._id.toString(), p.count]));
  const salesMap = new Map(sales.map((s) => [s._id.toString(), s.sales]));

  return shops.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    owner: s.ownerName,
    rating: s.rating,
    reviewCount: s.reviewCount,
    pendingReports: pendingMap.get(s._id.toString()) ?? 0,
    sales: salesMap.get(s._id.toString()) ?? 0,
    status: s.status as AdminShopView["status"],
  }));
}

export async function getAdminReports(): Promise<ReportView[]> {
  await connectDB();
  const rows = await Report.find()
    .sort({ createdAt: -1 })
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        shopId: mongoose.Types.ObjectId;
        shopName: string;
        reporterName: string;
        reason: string;
        description?: string;
        status: string;
        createdAt: Date;
      }[]
    >();
  return rows.map((r) => ({
    id: r._id.toString(),
    shopId: r.shopId.toString(),
    shopName: r.shopName,
    reporterName: r.reporterName,
    reason: r.reason,
    description: r.description ?? "",
    status: r.status as ReportView["status"],
    date: r.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getAdminLogs(): Promise<AdminLogView[]> {
  await connectDB();
  const rows = await AdminLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .lean<{ _id: mongoose.Types.ObjectId; message: string; createdAt: Date }[]>();
  return rows.map((r) => ({
    id: r._id.toString(),
    message: r.message,
    time: r.createdAt.toISOString(),
  }));
}

export async function getOrderById(id: string): Promise<OrderView | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const o = await Order.findById(id).lean<OrderDoc>();
  return o ? toOrderView(o) : null;
}

export async function getUserOrders(userId: string): Promise<OrderView[]> {
  if (!mongoose.isValidObjectId(userId)) return [];
  await connectDB();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean<OrderDoc[]>();
  return orders.map(toOrderView);
}