import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { requireRole } from "@/lib/session";
import { getSellerShop } from "@/lib/queries";
import { getSellerApproval } from "@/lib/shopSettings";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["seller"]);
  const shop = await getSellerShop();
  if (!shop) redirect("/open-shop");
  const approval = await getSellerApproval();

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        title="Apon Bazar"
        subtitle="Seller Panel"
        items={[
          { href: "/seller", label: "Dashboard", icon: "dashboard" },
          { href: "/seller/products", label: "My Products", icon: "products" },
          { href: "/seller/orders", label: "Orders", icon: "orders" },
          { href: "/seller/location", label: "Shop Location", icon: "shops" },
          { href: "/seller/settings", label: "Shop Settings", icon: "shops" },
          { href: "/seller/analytics", label: "Analytics", icon: "dashboard" },
        ]}
      />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 lg:p-8">
          {approval === "pending" && (
            <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              <b>Waiting for approval.</b> Your shop is hidden from customers until an admin
              approves it. You can add products and set up your shop in the meantime.
            </div>
          )}
          {approval === "rejected" && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <b>Your shop was not approved.</b> It is hidden from customers. Please contact the
              admin for details.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}