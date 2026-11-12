import SellerOrdersList from "@/components/dashboard/SellerOrdersList";
import { getSellerShop, getShopOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const shop = await getSellerShop();
  if (!shop) return <p className="text-gray-600">Shop paoa jayni. Age seed script chalao.</p>;

  const orders = await getShopOrders(shop.id);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
      <p className="text-sm text-gray-500">Shudhu tomar shop ({shop.name}) er order dekhabe</p>
      <SellerOrdersList orders={orders} />
    </div>
  );
}