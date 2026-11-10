"use client";

import Link from "next/link";
import { useState } from "react";
import { Store, ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/shops", label: "Shops" },
  { href: "/orders", label: "My Orders" },
];

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Store size={20} />
          </span>
          <span className="text-lg font-bold text-primary-dark">Apon Bazar</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <form action="/" className="ml-auto hidden max-w-xs flex-1 items-center rounded-full border border-gray-200 bg-cream px-3 md:flex">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            placeholder="Search products..."
            className="w-full bg-transparent px-2 py-2 text-sm outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link href="/cart" className="relative rounded-full p-2 text-gray-700 hover:bg-primary-light">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark sm:flex"
          >
            <User size={16} /> Login
          </Link>
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-white px-4 py-3 md:hidden">
          <form action="/" className="mb-3 flex items-center rounded-full border border-gray-200 bg-cream px-3">
            <Search size={16} className="text-gray-400" />
            <input name="q" placeholder="Search products..." className="w-full bg-transparent px-2 py-2 text-sm outline-none" />
          </form>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-primary">
            Login
          </Link>
        </div>
      )}
    </header>
  );
}