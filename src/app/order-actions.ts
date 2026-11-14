"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { notify } from "@/lib/notify";
import { orderCode } from "@/lib/queries";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Shop, { ShopDoc } from "@/models/Shop";

export async function cancelOrder(
  orderId: string
): Promise<{ ok: true; refunded: boolean } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in." };
  if (!mongoose.isValidObjectId(orderId)) return { ok: false, error: "Order not found." };

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || order.userId?.toString() !== user.id) {
    return { ok: false, error: "Order not found." };
  }
  if (order.cancelled) return { ok: false, error: "This order is already cancelled." };
  if (order.statusIndex >= 2) {
    return { ok: false, error: "This order is already packed and can no longer be cancelled." };
  }

  let refunded = false;

  if (order.paymentStatus === "paid" && order.paymentMethod.startsWith("Stripe")) {
    // Stripe payment hole age refund, refund na hole order cancel hobe na
    if (!order.transactionId.startsWith("pi_")) {
      return { ok: false, error: "Payment ID for the refund was not found. Please contact an admin." };
    }
    try {
      await getStripe().refunds.create({ payment_intent: order.transactionId });
      refunded = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Stripe error";
      return { ok: false, error: `Refund failed: ${msg}` };
    }
  } else if (order.paymentStatus === "unpaid" && order.stripeSessionId) {
    // Payment na kora Stripe page ta bondho kore dei, jate pore keu taka dite na pare
    try {
      await getStripe().checkout.sessions.expire(order.stripeSessionId);
    } catch {}
  }

  // Stock fire dei
  await Product.bulkWrite(
    order.items.map((i) => ({
      updateOne: {
        filter: { _id: i.productId },
        update: { $inc: { stock: i.qty, sold: -i.qty } },
      },
    }))
  );

  order.cancelled = true;
  order.cancelledAt = new Date();
  if (refunded) order.paymentStatus = "refunded";
  await order.save();

  const shop = await Shop.findById(order.shopId).lean<ShopDoc>();
  if (shop?.ownerId) {
    await notify(shop.ownerId.toString(), {
      title: "Order cancelled ❌",
      message: `The customer cancelled order #${orderCode(order._id.toString())}.`,
      link: "/seller/orders",
    });
  }

  revalidatePath("/", "layout");
  return { ok: true, refunded };
}