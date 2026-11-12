import { Users, Store, ShoppingBag, Banknote, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import { getAdminOverview, getAdminShops } from "@/lib/queries";
import { formatPrice, isUnderReview } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [o, shops] = await Promise.all([getAdminOverview(), getAdminShops()]);
  const underReview = shops.filter((s) => s.status === "active" && isUnderReview(s));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
      <p className="text-sm text-gray-500">Puro platform er overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={o.users.toLocaleString()} hint="Login add korle barbe" icon={<Users size={18} />} tone="blue" />
        <StatCard title="Total Shops" value={String(o.shops)} icon={<Store size={18} />} tone="green" />
        <StatCard title="Total Orders" value={o.orders.toLocaleString()} icon={<ShoppingBag size={18} />} tone="orange" />
        <StatCard title="Total Sales" value={formatPrice(o.sales)} icon={<Banknote size={18} />} tone="green" valueClass="text-green-700" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Top shops by sales</h2>
          <SimpleBarChart data={o.topShops} label="Sales" prefix="৳" />
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Most reported shops</h2>
            <div className="mt-4 space-y-3">
              {o.mostReported.length === 0 && <p className="text-sm text-gray-400">Kono report nai</p>}
              {o.mostReported.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{m.name}</span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{m.count} reports</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-red-50 p-6">
            <h2 className="flex items-center gap-2 font-bold text-red-700">
              <AlertTriangle size={18} /> Under review
            </h2>
            <p className="mt-1 text-xs text-red-600/80">Rating 3 er niche ba 5+ pending report hole ekhane ashe</p>
            <div className="mt-3 space-y-2">
              {underReview.length === 0 && <p className="text-sm text-gray-500">Kono shop under review e nai</p>}
              {underReview.map((s) => (
                <div key={s.id} className="rounded-xl bg-white p-3 text-sm">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">Rating {s.rating} · {s.pendingReports} pending reports</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}