"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function PriceHistoryChart({
  data,
}: {
  data: { day: string; price: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} width={50} />
          <Tooltip formatter={(value) => [`৳${value}`, "Price"] as [string, string]} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2e7d32"
            strokeWidth={3}
            dot={{ r: 4, fill: "#f57c00" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}