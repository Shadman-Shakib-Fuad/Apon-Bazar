import AdminShopsTable from "@/components/dashboard/AdminShopsTable";
import { getAdminShops } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminShopsPage() {
  const shops = await getAdminShops();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Shops</h1>
      <p className="mb-6 text-sm text-gray-500">Review kharap hole shop restrict kore dao</p>
      <AdminShopsTable shops={shops} />
    </div>
  );
}