import Sidebar from "@/components/dashboard/Sidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
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