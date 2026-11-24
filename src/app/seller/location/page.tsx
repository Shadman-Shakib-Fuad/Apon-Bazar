import ShopLocationForm from "@/components/dashboard/ShopLocationForm";
import { getSellerShopLocation } from "@/lib/geo";

export const dynamic = "force-dynamic";

export default async function SellerLocationPage() {
  const shop = await getSellerShopLocation();
  if (!shop) return <p className="text-gray-600">Shop not found.</p>;

  const initial =
    shop.lat !== undefined && shop.lng !== undefined ? { lat: shop.lat, lng: shop.lng } : null;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Shop Location</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        {shop.name}: mark the exact place of your shop so customers nearby can find you.
        {!initial && " You have not set a location yet, so your shop does not appear in nearby search."}
      </p>
      <ShopLocationForm initial={initial} />
    </div>
  );
}