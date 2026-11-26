import ShopSettingsForm from "@/components/dashboard/ShopSettingsForm";
import { getSellerShopSettings } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export default async function SellerSettingsPage() {
  const settings = await getSellerShopSettings();
  if (!settings) return <p className="text-gray-600">Shop not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Shop Settings</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        {settings.name}: set when you are open and how far you deliver.
      </p>
      <ShopSettingsForm initial={settings} />
    </div>
  );
}