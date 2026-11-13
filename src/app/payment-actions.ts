"use server";

import mongoose from "mongoose";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import Order from "@/models/Order";

export async function createCheckoutSession(
  orderId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Login koro." };
  if (!mongoose.isValidObjectId(orderId)) return { ok: false, error: "Order paoa jayni." };

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || order.userId?.toString() !== user.id) {
    return { ok: false, error: "Order paoa jayni." };
  }
  if (order.paymentStatus === "paid") return { ok: false, error: "Ei order er payment already hoyeche." };

  const currency = (process.env.STRIPE_CURRENCY ?? "bdt").toLowerCase();
  const rate = Number(process.env.STRIPE_TAKA_PER_UNIT ?? "1") || 1;
  // Stripe sob dam sobcheye chhoto ekok e (poisha/cent) nei
  const toMinor = (taka: number) => Math.round((taka / rate) * 100);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((i) => ({
    quantity: i.qty,
    price_data: {
      currency,
      unit_amount: toMinor(i.price),
      product_data: { name: `${i.name} (${i.unit})` },
    },
  }));

  if (order.deliveryCharge > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: toMinor(order.deliveryCharge),
        product_data: { name: "Delivery charge" },
      },
    });
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: user.email ?? undefined,
      metadata: { orderId: order._id.toString() },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/orders`,
    });

    await Order.updateOne(
      { _id: order._id },
      { stripeSessionId: session.id, paymentMethod: "Stripe (Card)" }
    );

    if (!session.url) return { ok: false, error: "Stripe payment page toiri hoyni." };
    return { ok: true, url: session.url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe e somossa hoyeche.";
    return { ok: false, error: msg };
  }
}