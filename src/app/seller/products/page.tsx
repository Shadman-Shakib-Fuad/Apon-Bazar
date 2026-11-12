import SellerProductManager from "@/components/dashboard/SellerProductManager";
import { getSellerShop, getSellerProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const shop = await getSellerShop();
  if (!shop) return <p className="text-gray-600">Shop paoa jayni. Age seed script chalao.</p>;

  const products = await getSellerProducts(shop.id);
  return <SellerProductManager products={products} />;
}