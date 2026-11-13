import Stripe from "stripe";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

let client: Stripe | null = null;

// Key na thakle shudhu jokhon Stripe lagbe tokhon error dibe, puro app bhenge jabe na
export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY .env.local e nai");
    client = new Stripe(key);
  }
  return client;
}

// Payment hoyeche kina dekhe order "paid" kore. Duibar chalaleo kono somossa nai
export async function fulfillSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return false;

  const orderId = session.metadata?.orderId;
  if (!orderId || !mongoose.isValidObjectId(orderId)) return false;

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? "";

  await connectDB();
  await Order.updateOne(
    { _id: orderId, paymentStatus: { $ne: "paid" } },
    {
      paymentStatus: "paid",
      paymentMethod: "Stripe (Card)",
      transactionId: paymentIntent || session.id,
    }
  );
  return true;
}