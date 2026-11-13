// @ts-nocheck
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Shop from "@/models/Shop";

const accounts = [
  { name: "Apon Admin", email: "admin@aponbazar.com", password: "Admin@12345", role: "admin" },
  { name: "Abdur Rahim", email: "rahim@aponbazar.com", password: "Seller@12345", role: "seller" },
  { name: "Demo Customer", email: "customer@aponbazar.com", password: "Customer@12345", role: "customer" },
];

async function main() {
  await connectDB();

  for (const a of accounts) {
    await User.deleteOne({ email: a.email });
    const user = await User.create({
      name: a.name,
      email: a.email,
      password: await bcrypt.hash(a.password, 10),
      role: a.role,
      provider: "credentials",
    });

    // Rahim er account ke "Rahim Vegetable Store" er malik banai
    if (a.role === "seller") {
      await Shop.updateOne({ name: "Rahim Vegetable Store" }, { ownerId: user._id });
    }
  }

  console.log("Done! Demo accounts:");
  accounts.forEach((a) => console.log(`  ${a.role}: ${a.email} / ${a.password}`));
  console.log("Deploy er age ei password gulo bodle nio.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});