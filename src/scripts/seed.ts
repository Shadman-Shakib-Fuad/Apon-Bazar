// @ts-nocheck
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Product from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import Review from "@/models/Review";
import Report from "@/models/Report";

const shopsData = [
  { name: "Rahim Vegetable Store", ownerName: "Abdur Rahim", area: "Main Bazar", emoji: "🥬", deliveryCharge: 30, rating: 4.7, reviewCount: 128 },
  { name: "Fresh Fish Corner", ownerName: "Jamal Hossain", area: "Station Road", emoji: "🐟", deliveryCharge: 40, rating: 4.5, reviewCount: 96 },
  { name: "Madina Grocery", ownerName: "Md Salim", area: "College Gate", emoji: "🛒", deliveryCharge: 30, rating: 4.3, reviewCount: 210 },
  { name: "Dairy Fresh House", ownerName: "Rubel Mia", area: "New Market", emoji: "🥛", deliveryCharge: 35, rating: 4.8, reviewCount: 75 },
  { name: "Sunrise Mart", ownerName: "Tarek Aziz", area: "Lake Road", emoji: "🏬", deliveryCharge: 30, rating: 2.1, reviewCount: 54 },
];

// shop = shopsData er index
const productsData = [
  { shop: 0, name: "Fresh Tomato", category: "Vegetables", price: 60, costPrice: 48, yesterdayPrice: 55, unit: "per kg", emoji: "🍅", stock: 50, sold: 120 },
  { shop: 0, name: "Potato", category: "Vegetables", price: 45, costPrice: 36, yesterdayPrice: 45, unit: "per kg", emoji: "🥔", stock: 120, sold: 210 },
  { shop: 0, name: "Green Chili", category: "Vegetables", price: 120, costPrice: 100, yesterdayPrice: 140, unit: "per kg", emoji: "🌶️", stock: 30, sold: 45 },
  { shop: 0, name: "Banana", category: "Fruits", price: 80, costPrice: 62, yesterdayPrice: 90, unit: "per dozen", emoji: "🍌", stock: 40, sold: 88 },
  { shop: 0, name: "Watermelon", category: "Fruits", price: 55, costPrice: 40, yesterdayPrice: 45, unit: "per kg", emoji: "🍉", stock: 0, sold: 30 },
  { shop: 1, name: "Rui Fish", category: "Fish", price: 320, costPrice: 270, yesterdayPrice: 300, unit: "per kg", emoji: "🐟", stock: 25, sold: 64 },
  { shop: 1, name: "Hilsa (Ilish)", category: "Fish", price: 1500, costPrice: 1300, yesterdayPrice: 1600, unit: "per kg", emoji: "🐠", stock: 10, sold: 22 },
  { shop: 2, name: "Miniket Rice", category: "Grocery", price: 72, costPrice: 64, yesterdayPrice: 70, unit: "per kg", emoji: "🍚", stock: 200, sold: 340 },
  { shop: 2, name: "Soybean Oil", category: "Grocery", price: 175, costPrice: 160, yesterdayPrice: 180, unit: "per litre", emoji: "🫒", stock: 80, sold: 150 },
  { shop: 2, name: "Sliced Bread", category: "Bakery", price: 60, costPrice: 48, yesterdayPrice: 60, unit: "per pack", emoji: "🍞", stock: 35, sold: 95 },
  { shop: 3, name: "Fresh Milk", category: "Dairy", price: 95, costPrice: 80, yesterdayPrice: 95, unit: "per litre", emoji: "🥛", stock: 60, sold: 180 },
  { shop: 3, name: "Sweet Yogurt", category: "Dairy", price: 140, costPrice: 110, yesterdayPrice: 130, unit: "per kg", emoji: "🥣", stock: 20, sold: 58 },
  { shop: 4, name: "Biscuit Pack", category: "Grocery", price: 40, costPrice: 32, yesterdayPrice: 40, unit: "per pack", emoji: "🍪", stock: 100, sold: 40 },
  { shop: 4, name: "Instant Noodles", category: "Grocery", price: 25, costPrice: 20, yesterdayPrice: 25, unit: "per pack", emoji: "🍜", stock: 150, sold: 70 },
];

const reportsData = [
  { shop: 4, reporterName: "Karim Uddin", reason: "Fake product", description: "The product was not original as shown in the photo." },
  { shop: 4, reporterName: "Nusrat Jahan", reason: "Wrong price", description: "Charged more than the price shown on the website." },
  { shop: 1, reporterName: "Sabbir Hossain", reason: "Bad behavior", description: "Seller was rude when I asked for a refund." },
  { shop: 4, reporterName: "Mitu Akter", reason: "Fake product", description: "Expired item delivered." },
  { shop: 2, reporterName: "Rashed Khan", reason: "Wrong price", description: "Price changed after I placed the order." },
];

const reviewsData = [
  { shop: 0, reviewerName: "Nusrat Jahan", rating: 5, comment: "Sobshomoy taja sabji pai." },
  { shop: 0, reviewerName: "Karim Uddin", rating: 4, comment: "Dam thik ache, delivery fast." },
  { shop: 3, reviewerName: "Mitu Akter", rating: 5, comment: "Doodh ekdom taja." },
  { shop: 4, reviewerName: "Sabbir Hossain", rating: 2, comment: "Quality bhalo na." },
  { shop: 4, reviewerName: "Rashed Khan", rating: 1, comment: "Expired product dise." },
];

async function main() {
  await connectDB();

  console.log("Purono data muchchi...");
  await Promise.all([
    Shop.deleteMany({}),
    Product.deleteMany({}),
    PriceHistory.deleteMany({}),
    Review.deleteMany({}),
    Report.deleteMany({}),
  ]);

  const shops = await Shop.insertMany(shopsData);

  const products = await Product.insertMany(
    productsData.map(({ shop, ...p }) => ({ ...p, shopId: shops[shop]._id }))
  );

  // 7 diner price history
  const history = [];
  for (const p of products) {
    const step = Math.max(1, Math.round(p.price * 0.02));
    const offsets = [-2, 1, -1, 2, 0];
    const values = [...offsets.map((o) => p.yesterdayPrice + o * step), p.yesterdayPrice, p.price];
    values.forEach((price, i) => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - (values.length - 1 - i));
      history.push({ productId: p._id, price, date: d });
    });
  }
  await PriceHistory.insertMany(history);

  await Report.insertMany(
    reportsData.map(({ shop, ...r }) => ({
      ...r,
      shopId: shops[shop]._id,
      shopName: shops[shop].name,
    }))
  );

  await Review.insertMany(
    reviewsData.map(({ shop, ...r }) => ({ ...r, shopId: shops[shop]._id }))
  );

  console.log(
    `Done! ${shops.length} shops, ${products.length} products, ${history.length} price history, ${reportsData.length} reports, ${reviewsData.length} reviews`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});