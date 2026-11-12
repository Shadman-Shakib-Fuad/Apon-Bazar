import Sidebar from "@/components/dashboard/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar
        title="Apon Bazar"
        subtitle="Admin Panel"
        items={[
          { href: "/admin", label: "Dashboard", icon: "dashboard" },
          { href: "/admin/shops", label: "Shops", icon: "shops" },
          { href: "/admin/reports", label: "Reports", icon: "reports" },
        ]}
      />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}