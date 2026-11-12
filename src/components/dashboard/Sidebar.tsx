"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, Store, Flag, Home } from "lucide-react";

const icons = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ClipboardList,
  shops: Store,
  reports: Flag,
  home: Home,
};

type Item = { href: string; label: string; icon: keyof typeof icons };

export default function Sidebar({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Item[];
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 bg-white p-4 lg:flex">
        <div className="flex items-center gap-2 px-2 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Store size={22} />
          </span>
          <div>
            <p className="font-bold leading-tight text-primary-dark">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {items.map((it) => {
            const Icon = icons[it.icon];
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-primary-light text-primary-dark" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} /> {it.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="mt-auto flex items-center gap-3 rounded-xl bg-accent-light px-3 py-2.5 text-sm font-medium text-accent"
        >
          <Home size={18} /> Back to website
        </Link>
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-30 border-b border-black/5 bg-white px-4 py-3 lg:hidden">
        <p className="mb-2 text-sm font-bold text-primary-dark">
          {title} <span className="font-normal text-gray-500">/ {subtitle}</span>
        </p>
        <div className="flex gap-2 overflow-x-auto">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                pathname === it.href ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {it.label}
            </Link>
          ))}
          <Link href="/" className="whitespace-nowrap rounded-full bg-accent-light px-4 py-1.5 text-sm text-accent">
            Website
          </Link>
        </div>
      </div>
    </>
  );
}