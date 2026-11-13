import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { requireRole } from "@/lib/session";
import { getSellerShop } from "@/lib/queries";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["seller"]);
  const shop = await getSellerShop();
  if (!shop) redirect("/open-shop");

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        title="Apon Bazar"
        subtitle="Seller Panel"
        items={[
          { href: "/seller", label: "Dashboard", icon: "dashboard" },
          { href: "/seller/products", label: "My Products", icon: "products" },
          { href: "/seller/orders", label: "Orders", icon: "orders" },
        ]}
      />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}