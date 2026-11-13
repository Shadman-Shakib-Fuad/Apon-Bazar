import { redirect } from "next/navigation";
import OpenShopForm from "@/components/shop/OpenShopForm";
import { requireRole } from "@/lib/session";
import { getSellerShop } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OpenShopPage() {
  await requireRole(["seller"]);
  const shop = await getSellerShop();
  if (shop) redirect("/seller");

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-extrabold text-gray-900">Tomar shop kholo</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Shop er basic tottho dao, tarpor product add korte parba.
      </p>
      <OpenShopForm />
    </div>
  );
}