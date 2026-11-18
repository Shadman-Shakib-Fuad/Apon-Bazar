import { redirect } from "next/navigation";
import OrdersList from "@/components/orders/OrdersList";
import { getCurrentUser } from "@/lib/session";
import { getUserOrders } from "@/lib/queries";
import { getReviewedMap } from "@/lib/engage";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getUserOrders(user.id);
  const reviewed = await getReviewedMap(user.id);
  return <OrdersList orders={orders} reviewed={reviewed} />;
}