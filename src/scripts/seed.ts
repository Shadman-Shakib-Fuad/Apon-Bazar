// @ts-nocheck
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";
import Product from "@/models/Product";
import Order from "@/models/Order";

const names = ["Karim Uddin", "Nusrat Jahan", "Sabbir Hossain", "Mitu Akter", "Rashed Khan", "Farhana Islam"];

// Chhoto random generator, jate protibar ek-i data ashe
let seed = 7;
function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

async function main() {
  await connectDB();
  await Order.deleteMany({});

  const shops = await Shop.find().sort({ _id: 1 });
  let total = 0;

  for (const shop of shops) {
    const products = await Product.find({ shopId: shop._id });
    if (products.length === 0) continue;

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const ordersToday = 2 + Math.floor(rand() * 3);

      for (let n = 0; n < ordersToday; n++) {
        const picked = [...products].sort(() => rand() - 0.5).slice(0, 1 + Math.floor(rand() * 3));

        // Rahim er shop e 3 din age "clearance sale" (cost er niche dam), tai oi din loss dekhabe
        const lossDay = shop.name === "Rahim Vegetable Store" && daysAgo === 3;

        const items = picked.map((p) => ({
          productId: p._id,
          name: p.name,
          emoji: p.emoji,
          unit: p.unit,
          price: lossDay ? Math.round(p.costPrice * 0.9) : p.price,
          costPrice: p.costPrice,
          qty: 1 + Math.floor(rand() * 4),
        }));

        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const deliveryCharge = shop.deliveryCharge;

        const created = new Date();
        created.setDate(created.getDate() - daysAgo);
        created.setHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0);

        await Order.create({
          shopId: shop._id,
          shopName: shop.name,
          items,
          subtotal,
          deliveryCharge,
          total: subtotal + deliveryCharge,
          deliveryType: "home",
          customerName: names[Math.floor(rand() * names.length)],
          phone: "017" + Math.floor(10000000 + rand() * 89999999),
          address: "House 12, Road 3, Main Bazar",
          statusIndex: 4,
          statusHistory: [0, 1, 2, 3, 4].map((k) => new Date(created.getTime() + k * 3600 * 1000)),
          paymentStatus: "paid",
          createdAt: created,
          updatedAt: created,
        });
        total++;
      }
    }
  }

  console.log(`Done! ${total} demo orders created`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});