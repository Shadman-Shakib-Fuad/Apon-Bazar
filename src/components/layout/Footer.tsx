import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-primary-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold">Apon Bazar</h3>
          <p className="mt-2 text-sm text-white/70">Fresh products from the local shops in your neighborhood.</p>
        </div>
        <div>
          <h4 className="font-semibold">Quick Links</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li><Link href="/shops" className="hover:text-white">All Shops</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link href="/orders" className="hover:text-white">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">For Sellers</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li><Link href="/seller" className="hover:text-white">Seller Dashboard</Link></li>
            <li><Link href="/register" className="hover:text-white">Open a Shop</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © 2026 Apon Bazar. CSE346 Project.
      </div>
    </footer>
  );
}