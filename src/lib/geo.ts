import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Shop, { ShopDoc } from "@/models/Shop";

export async function getSellerShopLocation() {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") return null;

  await connectDB();
  const shop = await Shop.findOne({ ownerId: user.id }).lean<ShopDoc>();
  if (!shop) return null;

  const coords = shop.location?.coordinates;
  return {
    name: shop.name,
    lat: coords ? coords[1] : undefined,
    lng: coords ? coords[0] : undefined,
  };
}