import type { CartItem } from "@/components/cart/CartProvider";

export const ORDER_STEPS = [
  "Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
] as const;

export type Order = {
  id: string;
  shopId: string;
  shopName: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryType: "home" | "pickup";
  customerName: string;
  phone: string;
  address: string;
  statusIndex: number;
  history: string[];
  createdAt: string;
};

const KEY = "apon-bazar-orders";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function addOrder(order: Order) {
  saveOrders([order, ...getOrders()]);
}