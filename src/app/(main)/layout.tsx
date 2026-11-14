import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { getCurrentUser } from "@/lib/session";
import { getWishlistIds, getUnreadCount } from "@/lib/engage";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const [wishIds, unread] = user
    ? await Promise.all([getWishlistIds(user.id), getUnreadCount(user.id)])
    : [[] as string[], 0];

  return (
    <WishlistProvider initialIds={wishIds} loggedIn={!!user}>
      <div className="flex min-h-screen flex-col">
        <Navbar
          user={
            user
              ? { name: user.name ?? "User", role: user.role, image: user.image ?? null }
              : null
          }
          unread={unread}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </WishlistProvider>
  );
}