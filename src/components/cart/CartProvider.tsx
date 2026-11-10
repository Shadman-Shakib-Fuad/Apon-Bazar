"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  productId: string;
  shopId: string;
  shopName: string;
  name: string;
  price: number;
  emoji: string;
  unit: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "qty">) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearShop: (shopId: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("apon-bazar-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("apon-bazar-cart", JSON.stringify(items));
  }, [items, loaded]);

  const addItem: CartContextType["addItem"] = (item) => {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === item.productId);
      if (found) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty: CartContextType["updateQty"] = (productId, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const removeItem: CartContextType["removeItem"] = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const clearShop: CartContextType["clearShop"] = (shopId) =>
    setItems((prev) => prev.filter((i) => i.shopId !== shopId));

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, addItem, updateQty, removeItem, clearShop }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}