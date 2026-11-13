import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle, Download } from "lucide-react";
import { getStripe, fulfillSession } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import { getOrderById } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { session_id } = await searchParams;
  if (!session_id) redirect("/orders");

  let orderId = "";
  let paid = false;

  try {
    // Webhook ashar age-o jate order "paid" hoy, tai server theke Stripe ke jiggesh kore nichhi
    const session = await getStripe().checkout.sessions.retrieve(session_id);
    orderId = session.metadata?.orderId ?? "";
    const order = orderId ? await getOrderById(orderId) : null;
    if (order && order.userId === user.id) {
      paid = await fulfillSession(session);
    }
  } catch {
    paid = false;
  }

  const order = paid && orderId ? await getOrderById(orderId) : null;

  if (!paid || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <XCircle size={64} className="mx-auto text-red-400" />
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Payment complete hoyni</h1>
        <p className="mt-2 text-sm text-gray-500">
          Taka kete thakle kichukkhon por My Orders e check koro, na hole abar try koro.
        </p>
        <Link href="/orders" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
          My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <CheckCircle2 size={72} className="mx-auto text-green-500" />
      <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Payment successful! 🎉</h1>
      <p className="mt-1 text-sm text-gray-500">Tomar order confirm hoyeche</p>

      <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 text-left text-sm">
        <div className="flex justify-between py-1"><span className="text-gray-500">Order</span><b>#{order.code}</b></div>
        <div className="flex justify-between py-1"><span className="text-gray-500">Shop</span><b>{order.shopName}</b></div>
        <div className="flex justify-between py-1"><span className="text-gray-500">Total paid</span><b>{formatPrice(order.total)}</b></div>
        <div className="flex justify-between gap-4 py-1">
          <span className="text-gray-500">Transaction ID</span>
          <b className="break-all text-right text-xs">{order.transactionId}</b>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <a
          href={`/api/receipt/${order.id}`}
          className="flex items-center gap-1.5 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light"
        >
          <Download size={15} /> Receipt
        </a>
        <Link href="/orders" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          My Orders
        </Link>
      </div>
    </div>
  );
}