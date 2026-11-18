// @ts-nocheck
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Review from "@/models/Review";

async function main() {
  await connectDB();

  const old = await Review.deleteMany({ productId: { $exists: false } });
  console.log(`Deleted ${old.deletedCount} old shop-level reviews`);

  const stats = await Review.aggregate([
    { $group: { _id: "$shopId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const map = new Map(stats.map((s) => [s._id.toString(), s]));

  const shops = await Shop.find();
  for (const shop of shops) {
    const s = map.get(shop._id.toString());
    shop.rating = s ? Math.round(s.avg * 10) / 10 : 0;
    shop.reviewCount = s ? s.count : 0;
    await shop.save();
    console.log(`${shop.name}: ${shop.rating} (${shop.reviewCount})`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});