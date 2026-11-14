"use client";

import Link from "next/link";
import { useState } from "react";
import { Store, ShoppingCart, Search, User, Menu, X, LogOut, Heart, Bell } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { logoutAction } from "@/app/(auth)/actions";

export type NavUser = {
  name: string;
  role: "customer" | "seller" | "admin";
  image: string | null;
} | null;

const links = [
  { href: "/", label: "Home" },
  { href: "/shops", label: "Shops" },
  { href: "/orders", label: "My Orders" },
];

export default function Navbar({ user, unread = 0 }: { user: NavUser; unread?: number }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  const panel =
    user?.role === "seller"
      ? { href: "/seller", label: "Seller Panel" }
      : user?.role === "admin"
      ? { href: "/admin", label: "Admin Panel" }
      : null;

  const iconBtn = "relative rounded-full p-2 text-gray-700 hover:bg-primary-light";
  const badge =
    "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white";

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
          <input name="q" placeholder="Search products..." className="w-full bg-transparent px-2 py-2 text-sm outline-none" />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {user && (
            <>
              <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                <Heart size={22} />
              </Link>
              <Link href="/notifications" className={iconBtn} aria-label="Notifications">
                <Bell size={22} />
                {unread > 0 && <span className={`${badge} bg-red-500`}>{unread > 9 ? "9+" : unread}</span>}
              </Link>
            </>
          )}

          <Link href="/cart" className={iconBtn} aria-label="Cart">
            <ShoppingCart size={22} />
            {count > 0 && <span className={`${badge} bg-accent`}>{count}</span>}
          </Link>

          {user ? (
            <div className="relative ml-1 hidden sm:block">
              <button
                onClick={() => setMenu(!menu)}
                className="flex items-center gap-2 rounded-full bg-primary-light py-1.5 pl-1.5 pr-4 text-sm font-semibold text-primary-dark"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </button>

              {menu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-black/5 bg-white p-2 shadow-lg">
                  <p className="px-3 py-2 text-xs capitalize text-gray-400">{user.role} account</p>
                  <Link href="/profile" onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-gray-50">
                    My Profile
                  </Link>
                  <Link href="/orders" onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-gray-50">
                    My Orders
                  </Link>
                  <Link href="/wishlist" onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-gray-50">
                    Wishlist
                  </Link>
                  {panel && (
                    <Link href={panel.href} onClick={() => setMenu(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-light">
                      {panel.label}
                    </Link>
                  )}
                  {/* Ekhane kono onClick nai, jate form thikmoto submit hoy */}
                  <form action={logoutAction}>
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={15} /> Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark sm:flex"
            >
              <User size={16} /> Login
            </Link>
          )}

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
          {user ? (
            <>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Wishlist</Link>
              <Link href="/notifications" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
                Notifications {unread > 0 && `(${unread})`}
              </Link>
              <Link href="/profile" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">My Profile</Link>
              {panel && (
                <Link href={panel.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-primary">
                  {panel.label}
                </Link>
              )}
              <form action={logoutAction}>
                <button className="py-2 text-sm font-semibold text-red-600">Logout ({user.name.split(" ")[0]})</button>
              </form>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-primary">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}