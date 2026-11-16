// @ts-nocheck
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Product from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import Wishlist from "@/models/Wishlist";
import Review from "@/models/Review";
import Report from "@/models/Report";
import Order from "@/models/Order";

// Shudhu ei shop gulo delete hobe. Onno kono shop e hat dibe na
const DELETE_SHOPS = [
  "Fresh Fish Corner",
  "Madina Grocery",
  "Dairy Fresh House",
  "Sunrise Mart",
];

async function main() {
  await connectDB();

  const shops = await Shop.find({ name: { $in: DELETE_SHOPS } });
  if (shops.length === 0) {
    console.log("No matching shops found. Nothing deleted.");
    await mongoose.disconnect();
    return;
  }

  console.log("Deleting shops:", shops.map((s) => s.name).join(", "));

  const shopIds = shops.map((s) => s._id);
  const products = await Product.find({ shopId: { $in: shopIds } }).select("_id");
  const productIds = products.map((p) => p._id);

  const result = {
    priceHistory: (await PriceHistory.deleteMany({ productId: { $in: productIds } })).deletedCount,
    wishlist: (await Wishlist.deleteMany({ productId: { $in: productIds } })).deletedCount,
    products: (await Product.deleteMany({ shopId: { $in: shopIds } })).deletedCount,
    reviews: (await Review.deleteMany({ shopId: { $in: shopIds } })).deletedCount,
    reports: (await Report.deleteMany({ shopId: { $in: shopIds } })).deletedCount,
    orders: (await Order.deleteMany({ shopId: { $in: shopIds } })).deletedCount,
    shops: (await Shop.deleteMany({ _id: { $in: shopIds } })).deletedCount,
  };

  console.log("Deleted:", result);

  const left = await Shop.find().select("name");
  console.log("Shops left:", left.map((s) => s.name).join(", "));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});