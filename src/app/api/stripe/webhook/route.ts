import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, fulfillSession } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ message: "Webhook config nai" }, { status: 400 });
  }

  // Signature milanor jonno raw body lage, tai req.text()
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await fulfillSession(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}