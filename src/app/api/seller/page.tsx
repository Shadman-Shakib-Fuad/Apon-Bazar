import { TrendingUp, Wallet, Receipt, Trophy } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ProfitChart from "@/components/dashboard/ProfitChart";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import { dailySales, sellerProducts } from "@/data/dashboard";
import { formatPrice } from "@/lib/utils";

export default function SellerDashboard() {
  const today = dailySales[dailySales.length - 1];
  const weekRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
  const weekProfit = dailySales.reduce((s, d) => s + d.profit, 0);

  const items = sellerProducts
    .map((p) => ({
      ...p,
      revenue: p.price * p.sold,
      profit: (p.price - p.costPrice) * p.sold,
    }))
    .sort((a, b) => b.sold - a.sold);

  const best = items[0];
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);

  const categories = Object.entries(
    items.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + i.revenue;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, percent: Math.round((value / totalRevenue) * 100) }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Seller Dashboard</h1>
      <p className="text-sm text-gray-500">Rahim Vegetable Store · last 7 days</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={today.profit >= 0 ? "Today's Profit" : "Today's Loss"}
          value={formatPrice(Math.abs(today.profit))}
          hint={`Revenue ${formatPrice(today.revenue)} - Cost ${formatPrice(today.cost)}`}
          icon={<Wallet size={18} />}
          tone={today.profit >= 0 ? "green" : "red"}
          valueClass={today.profit >= 0 ? "text-green-700" : "text-red-600"}
        />
        <StatCard title="Weekly Revenue" value={formatPrice(weekRevenue)} hint="Total selling price" icon={<Receipt size={18} />} tone="blue" />
        <StatCard
          title="Weekly Profit"
          value={formatPrice(weekProfit)}
          hint="Selling price - Cost price"
          icon={<TrendingUp size={18} />}
          tone="green"
          valueClass="text-green-700"
        />
        <StatCard title="Best Seller" value={best.name} hint={`${best.sold} units sold`} icon={<Trophy size={18} />} tone="orange" />
      </div>

      {/* Profit chart */}
      <section className="mt-6 rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Daily Profit / Loss</h2>
        <p className="mb-2 text-xs text-gray-500">Profit = Selling Price - Cost Price</p>
        <ProfitChart data={dailySales} />
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {dailySales.map((d) => (
            <span
              key={d.day}
              className={`rounded-full px-3 py-1 font-medium ${d.profit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            >
              {d.day}: {d.profit >= 0 ? "+" : "-"}{formatPrice(Math.abs(d.profit))}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items sold */}
        <section className="rounded-3xl border border-black/5 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Items sold</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Sold</th>
                  <th className="py-2">Revenue</th>
                  <th className="py-2">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3 font-medium text-gray-900">{i.emoji} {i.name}</td>
                    <td className="py-3">{i.sold}</td>
                    <td className="py-3">{formatPrice(i.revenue)}</td>
                    <td className="py-3 font-semibold text-green-700">{formatPrice(i.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mb-1 mt-6 text-sm font-semibold text-gray-700">Units sold per item</h3>
          <SimpleBarChart data={items.map((i) => ({ name: i.name, value: i.sold }))} label="Units sold" color="#f57c00" />
        </section>

        <div className="space-y-6">
          {/* Best selling */}
          <section className="rounded-3xl bg-primary p-6 text-white">
            <p className="flex items-center gap-2 text-sm text-white/80"><Trophy size={16} /> Best selling item</p>
            <div className="mt-4 flex h-24 items-center justify-center rounded-2xl bg-white/15 text-6xl">{best.emoji}</div>
            <h3 className="mt-4 text-xl font-bold">{best.name}</h3>
            <p className="text-sm text-white/80">{best.category} · {best.unit}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/15 p-3"><p className="text-white/70">Units sold</p><p className="font-bold">{best.sold}</p></div>
              <div className="rounded-xl bg-white/15 p-3"><p className="text-white/70">Revenue</p><p className="font-bold">{formatPrice(best.revenue)}</p></div>
              <div className="rounded-xl bg-white/15 p-3"><p className="text-white/70">Selling price</p><p className="font-bold">{formatPrice(best.price)}</p></div>
              <div className="rounded-xl bg-white/15 p-3"><p className="text-white/70">Cost price</p><p className="font-bold">{formatPrice(best.costPrice)}</p></div>
            </div>
          </section>

          {/* Category share */}
          <section className="rounded-3xl border border-black/5 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Sales by category</h2>
            <div className="mt-4 space-y-4">
              {categories.map((c) => (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{c.name}</span>
                    <span className="text-gray-500">{c.percent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div className="h-3 rounded-full bg-primary" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}