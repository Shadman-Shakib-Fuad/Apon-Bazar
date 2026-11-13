import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/session";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        user={
          user
            ? { name: user.name ?? "User", role: user.role, image: user.image ?? null }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}