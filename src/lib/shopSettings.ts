import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Shop, { ShopDoc } from "@/models/Shop";

export async function getSellerShopSettings() {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") return null;

  await connectDB();
  const s = await Shop.findOne({ ownerId: user.id }).lean<ShopDoc>();
  if (!s) return null;

  return {
    name: s.name,
    hasLocation: Boolean(s.location),
    opensAt: s.opensAt ?? "",
    closesAt: s.closesAt ?? "",
    temporarilyClosed: s.temporarilyClosed ?? false,
    deliveryRadiusKm: s.deliveryRadiusKm ?? 0,
    deliveryBaseCharge: s.deliveryBaseCharge ?? s.deliveryCharge,
    deliveryPerKm: s.deliveryPerKm ?? 0,
  };
}
export async function getSellerApproval(): Promise<
  "pending" | "approved" | "rejected" | "legacy" | null
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") return null;

  await connectDB();
  const s = await Shop.findOne({ ownerId: user.id })
    .select("approvalStatus")
    .lean<{ approvalStatus?: string }>();
  if (!s) return null;

  return (s.approvalStatus ?? "legacy") as "pending" | "approved" | "rejected" | "legacy";
}