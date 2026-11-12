import { Users, Store, ShoppingBag, Banknote, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import { adminShops, adminStats, initialReports } from "@/data/dashboard";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const topShops = [...adminShops]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((s) => ({ name: s.name.split(" ")[0], value: s.sales }));

  const reportCount = initialReports.reduce<Record<string, number>>((acc, r) => {
    acc[r.shopName] = (acc[r.shopName] ?? 0) + 1;
    return acc;
  }, {});
  const mostReported = Object.entries(reportCount).sort((a, b) => b[1] - a[1]);

  const underReview = adminShops.filter((s) => s.rating < 3 || s.reports >= 5);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
      <p className="text-sm text-gray-500">Puro platform er overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value={adminStats.users.toLocaleString()} icon={<Users size={18} />} tone="blue" />
        <StatCard title="Total Shops" value={String(adminStats.shops)} icon={<Store size={18} />} tone="green" />
        <StatCard title="Total Orders" value={adminStats.orders.toLocaleString()} icon={<ShoppingBag size={18} />} tone="orange" />
        <StatCard title="Total Sales" value={formatPrice(adminStats.sales)} icon={<Banknote size={18} />} tone="green" valueClass="text-green-700" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Top shops by sales</h2>
          <SimpleBarChart data={topShops} label="Sales" prefix="৳" />
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Most reported shops</h2>
            <div className="mt-4 space-y-3">
              {mostReported.map(([name, n]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{name}</span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{n} reports</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-red-50 p-6">
            <h2 className="flex items-center gap-2 font-bold text-red-700">
              <AlertTriangle size={18} /> Under review
            </h2>
            <p className="mt-1 text-xs text-red-600/80">Rating 3 er niche ba 5+ report hole auto review e jay</p>
            <div className="mt-3 space-y-2">
              {underReview.map((s) => (
                <div key={s.id} className="rounded-xl bg-white p-3 text-sm">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">Rating {s.rating} · {s.reports} reports</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}