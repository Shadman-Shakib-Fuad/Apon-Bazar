import { ReactNode } from "react";

const tones = {
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-sky-100 text-sky-600",
};

export default function StatCard({
  title,
  value,
  hint,
  icon,
  tone = "green",
  valueClass = "text-gray-900",
}: {
  title: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: keyof typeof tones;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-2xl font-extrabold ${valueClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}