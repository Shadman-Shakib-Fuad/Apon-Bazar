// @ts-nocheck
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Notification from "@/models/Notification";

const map = {
  "Sobshomoy taja sabji pai.": "Always fresh vegetables.",
  "Dam thik ache, delivery fast.": "Fair prices and fast delivery.",
  "Doodh ekdom taja.": "The milk is perfectly fresh.",
  "Quality bhalo na.": "The quality is not good.",
  "Expired product dise.": "They delivered an expired product.",
};

async function main() {
  await connectDB();

  for (const [from, to] of Object.entries(map)) {
    const r = await Review.updateMany({ comment: from }, { comment: to });
    console.log(`"${from}" -> ${r.modifiedCount} updated`);
  }

  const n = await Notification.deleteMany({});
  console.log(`Deleted ${n.deletedCount} old test notifications`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});