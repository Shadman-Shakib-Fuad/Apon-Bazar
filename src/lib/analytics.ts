import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import type { OrderDoc } from "@/lib/queries";

const hourFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  hourCycle: "h23",
});
const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", weekday: "short" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function hourOf(d: Date) {
  return Number(hourFmt.format(d));
}

function shortHour(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`;
}

export function longHour(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
}

export async function getSellerAnalytics(shopId: string, days: number) {
  await connectDB();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const [inRange, all] = await Promise.all([
    Order.find({ shopId, createdAt: { $gte: start }, cancelled: { $ne: true } }).lean<OrderDoc[]>(),
    Order.find({ shopId, cancelled: { $ne: true } }).lean<OrderDoc[]>(),
  ]);

  let revenue = 0;
  let profit = 0;
  const hours = Array.from({ length: 24 }, () => 0);
  const weekdays = Array.from({ length: 7 }, () => 0);
  const products = new Map<string, { name: string; qty: number; revenue: number; profit: number }>();

  for (const o of inRange) {
    hours[hourOf(o.createdAt)] += 1;
    const wd = WEEKDAYS.indexOf(dayFmt.format(o.createdAt));
    if (wd >= 0) weekdays[wd] += 1;

    for (const it of o.items) {
      const line = it.price * it.qty;
      const cost = (it.costPrice ?? 0) * it.qty;
      revenue += line;
      profit += line - cost;

      const key = it.productId.toString();
      const cur = products.get(key) ?? { name: it.name, qty: 0, revenue: 0, profit: 0 };
      cur.qty += it.qty;
      cur.revenue += line;
      cur.profit += line - cost;
      products.set(key, cur);
    }
  }

  // Customer: login kora hole account, na hole naam + phone diye chini
  const customers = new Map<string, { name: string; orders: number; spent: number }>();
  for (const o of all) {
    const key = o.userId ? o.userId.toString() : `${o.customerName}|${o.phone}`;
    const cur = customers.get(key) ?? { name: o.customerName, orders: 0, spent: 0 };
    cur.orders += 1;
    cur.spent += o.subtotal;
    customers.set(key, cur);
  }
  const customerList = Array.from(customers.values());
  const repeat = customerList.filter((c) => c.orders >= 2).length;

  const peak = hours.indexOf(Math.max(...hours));
  const busiestDay = weekdays.indexOf(Math.max(...weekdays));

  return {
    days,
    orders: inRange.length,
    revenue,
    profit,
    avgOrder: inRange.length ? Math.round(revenue / inRange.length) : 0,
    byHour: hours.map((value, h) => ({ name: shortHour(h), value })),
    byWeekday: weekdays.map((value, i) => ({ name: WEEKDAYS[i], value })),
    peakHour: inRange.length ? { hour: peak, orders: hours[peak] } : null,
    busiestDay: inRange.length ? { name: WEEKDAYS[busiestDay], orders: weekdays[busiestDay] } : null,
    topProducts: Array.from(products.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5),
    customers: {
      total: customerList.length,
      repeat,
      repeatRate: customerList.length ? Math.round((repeat / customerList.length) * 100) : 0,
      top: customerList.sort((a, b) => b.spent - a.spent).slice(0, 5),
    },
  };
}