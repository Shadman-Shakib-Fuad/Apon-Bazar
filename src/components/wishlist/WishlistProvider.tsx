"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/wishlist-actions";

type Ctx = {
  ids: string[];
  toggle: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<Ctx | null>(null);

export function WishlistProvider({
  initialIds,
  loggedIn,
  children,
}: {
  initialIds: string[];
  loggedIn: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [ids, setIds] = useState<string[]>(initialIds);

  async function toggle(productId: string) {
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    const was = ids.includes(productId);
    // Age screen e dekhai, tarpor server e save kori
    setIds((prev) => (was ? prev.filter((i) => i !== productId) : [...prev, productId]));

    const res = await toggleWishlist(productId);
    if (res.ok) {
      router.refresh();
    } else {
      setIds((prev) => (was ? [...prev, productId] : prev.filter((i) => i !== productId)));
    }
  }

  return <WishlistContext.Provider value={{ ids, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}