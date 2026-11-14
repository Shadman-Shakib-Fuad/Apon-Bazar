import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop, { ShopDoc } from "@/models/Shop";
import Product, { ProductDoc } from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import type { ShopView, ProductView } from "@/types";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toShop(s: ShopDoc): ShopView {
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

export function toProduct(p: ProductDoc, shops: Map<string, ShopDoc>): ProductView {
  const shop = shops.get(p.shopId.toString());
  return {
    id: p._id.toString(),
    shopId: p.shopId.toString(),
    shopName: shop?.name ?? "",
    shopEmoji: shop?.emoji ?? "🏪",
    shopStatus: (shop?.status ?? "active") as ProductView["shopStatus"],
    deliveryCharge: shop?.deliveryCharge ?? 0,
    name: p.name,
    category: p.category,
    price: p.price,
    yesterdayPrice: p.yesterdayPrice,
    unit: p.unit,
    emoji: p.emoji,
    stock: p.stock,
  };
}

export async function shopMap() {
  const shops = await Shop.find().lean<ShopDoc[]>();
  return new Map(shops.map((s) => [s._id.toString(), s]));
}

export async function getShops(): Promise<ShopView[]> {
  await connectDB();
  const shops = await Shop.find().sort({ _id: 1 }).lean<ShopDoc[]>();
  return shops.map(toShop);
}

export async function getShop(id: string): Promise<ShopView | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const shop = await Shop.findById(id).lean<ShopDoc>();
  return shop ? toShop(shop) : null;
}

export async function getProducts(
  opts: { category?: string; q?: string; shopId?: string } = {}
): Promise<ProductView[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (opts.category) filter.category = opts.category;
  if (opts.shopId) filter.shopId = opts.shopId;
  if (opts.q) filter.name = { $regex: escapeRegex(opts.q), $options: "i" };

  const [products, shops] = await Promise.all([
    Product.find(filter).select("-costPrice").sort({ _id: 1 }).lean<ProductDoc[]>(),
    shopMap(),
  ]);
  return products.map((p) => toProduct(p, shops));
}

export async function getProduct(id: string): Promise<ProductView | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const [product, shops] = await Promise.all([
    Product.findById(id).select("-costPrice").lean<ProductDoc>(),
    shopMap(),
  ]);
  return product ? toProduct(product, shops) : null;
}

export async function getPriceHistory(productId: string) {
  await connectDB();
  const rows = await PriceHistory.find({ productId })
    .sort({ date: 1 })
    .lean<{ price: number; date: Date }[]>();

  const points = rows.map((r) => ({
    day: new Date(r.date).toLocaleDateString("en-US", { weekday: "short" }),
    price: r.price,
  }));

  let ups = 0;
  let downs = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].price > rows[i - 1].price) ups++;
    else if (rows[i].price < rows[i - 1].price) downs++;
  }

  return { points, ups, downs };
}

export type ProductSearch = {
  category?: string;
  q?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "price_asc" | "price_desc" | "newest";
};

export async function searchProducts(opts: ProductSearch = {}): Promise<ProductView[]> {
  await connectDB();
  const filter: Record<string, unknown> = {};

  if (opts.category) filter.category = opts.category;
  if (opts.q) filter.name = { $regex: escapeRegex(opts.q), $options: "i" };

  if (opts.minPrice !== undefined || opts.maxPrice !== undefined) {
    const range: Record<string, number> = {};
    if (opts.minPrice !== undefined) range.$gte = opts.minPrice;
    if (opts.maxPrice !== undefined) range.$lte = opts.maxPrice;
    filter.price = range;
  }

  // Rating shop er, tai age bhalo rating er shop gulo khuje ber kori
  if (opts.minRating) {
    const good = await Shop.find({ rating: { $gte: opts.minRating } })
      .select("_id")
      .lean<{ _id: mongoose.Types.ObjectId }[]>();
    filter.shopId = { $in: good.map((s) => s._id) };
  }
  if (opts.shopId) filter.shopId = opts.shopId;

  const sorts: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { _id: -1 },
  };

  const [products, shops] = await Promise.all([
    Product.find(filter)
      .select("-costPrice")
      .sort(sorts[opts.sort ?? ""] ?? { _id: 1 })
      .lean<ProductDoc[]>(),
    shopMap(),
  ]);

  return products.map((p) => toProduct(p, shops));
}