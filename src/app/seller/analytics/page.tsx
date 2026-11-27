import Link from "next/link";
import { ShoppingBag, Banknote, TrendingUp, Users } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import { getSellerShop } from "@/lib/queries";
import { getSellerAnalytics, longHour } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;

  const shop = await getSellerShop();
  if (!shop) return <p className="text-gray-600">Shop not found.</p>;

  const a = await getSellerAnalytics(shop.id, days);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">{shop.name} · last {days} days</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/seller/analytics?days=${r}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                r === days ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Orders" value={a.orders.toLocaleString()} icon={<ShoppingBag size={18} />} tone="orange" />
        <StatCard title="Revenue" value={formatPrice(a.revenue)} icon={<Banknote size={18} />} tone="blue" />
        <StatCard
          title="Average order"
          value={formatPrice(a.avgOrder)}
          hint="Revenue / orders"
          icon={<TrendingUp size={18} />}
          tone="green"
        />
        <StatCard
          title={a.profit >= 0 ? "Profit" : "Loss"}
          value={formatPrice(Math.abs(a.profit))}
          hint="Selling price - Cost price"
          icon={<Banknote size={18} />}
          tone={a.profit >= 0 ? "green" : "red"}
          valueClass={a.profit >= 0 ? "text-green-700" : "text-red-600"}
        />
      </div>

      {a.orders === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-12 text-center text-gray-500">
          No orders in the last {days} days. Analytics will appear once you get orders.
        </div>
      ) : (
        <>
          {/* Insight */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {a.peakHour && (
              <div className="rounded-2xl bg-primary p-5 text-white">
                <p className="text-xs uppercase text-white/70">Busiest hour</p>
                <p className="mt-1 text-2xl font-extrabold">{longHour(a.peakHour.hour)}</p>
                <p className="text-sm text-white/80">{a.peakHour.orders} orders. Keep stock ready around this time.</p>
              </div>
            )}
            {a.busiestDay && (
              <div className="rounded-2xl bg-accent p-5 text-white">
                <p className="text-xs uppercase text-white/70">Busiest day</p>
                <p className="mt-1 text-2xl font-extrabold">{a.busiestDay.name}</p>
                <p className="text-sm text-white/80">{a.busiestDay.orders} orders on this weekday.</p>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-black/5 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Orders by hour</h2>
              <p className="text-xs text-gray-500">Bangladesh time (a = AM, p = PM)</p>
              <SimpleBarChart data={a.byHour} label="Orders" color="#2e7d32" />
            </section>
            <section className="rounded-3xl border border-black/5 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Orders by weekday</h2>
              <p className="text-xs text-gray-500">Which days are busy</p>
              <SimpleBarChart data={a.byWeekday} label="Orders" color="#f57c00" />
            </section>
          </div>

          {/* Top products */}
          <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Top 5 products</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-gray-400">
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">Product</th>
                    <th className="py-2">Units sold</th>
                    <th className="py-2">Revenue</th>
                    <th className="py-2">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {a.topProducts.map((p, i) => (
                    <tr key={p.name}>
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="py-3">{p.qty}</td>
                      <td className="py-3">{formatPrice(p.revenue)}</td>
                      <td className={`py-3 font-semibold ${p.profit >= 0 ? "text-green-700" : "text-red-600"}`}>
                        {p.profit >= 0 ? "" : "-"}{formatPrice(Math.abs(p.profit))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="mb-1 mt-6 text-sm font-semibold text-gray-700">Units sold</h3>
            <SimpleBarChart
              data={a.topProducts.map((p) => ({ name: p.name, value: p.qty }))}
              label="Units sold"
              color="#f57c00"
            />
          </section>

          {/* Customers */}
          <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Users size={18} /> Customers (all time)
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-cream p-4">
                <p className="text-xs text-gray-500">Total customers</p>
                <p className="text-2xl font-extrabold text-gray-900">{a.customers.total}</p>
              </div>
              <div className="rounded-2xl bg-cream p-4">
                <p className="text-xs text-gray-500">Repeat customers</p>
                <p className="text-2xl font-extrabold text-gray-900">{a.customers.repeat}</p>
                <p className="text-xs text-gray-400">2 or more orders</p>
              </div>
              <div className="rounded-2xl bg-cream p-4">
                <p className="text-xs text-gray-500">Repeat rate</p>
                <p className="text-2xl font-extrabold text-green-700">{a.customers.repeatRate}%</p>
              </div>
            </div>

            <h3 className="mb-2 mt-6 text-sm font-semibold text-gray-700">Top customers by spending</h3>
            <div className="divide-y divide-gray-100">
              {a.customers.top.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-gray-900">
                    {c.name}
                    {c.orders >= 2 && (
                      <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        Repeat
                      </span>
                    )}
                  </span>
                  <span className="text-gray-600">
                    {c.orders} order{c.orders === 1 ? "" : "s"} · {formatPrice(c.spent)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}