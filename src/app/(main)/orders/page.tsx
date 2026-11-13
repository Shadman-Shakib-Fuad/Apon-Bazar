import { redirect } from "next/navigation";
import OrdersList from "@/components/orders/OrdersList";
import { getCurrentUser } from "@/lib/session";
import { getUserOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getUserOrders(user.id);
  return <OrdersList orders={orders} />;
}