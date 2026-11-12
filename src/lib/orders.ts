export const ORDER_STEPS = [
  "Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
] as const;

// Login na thaka porjonto, ei browser er order id gulo localStorage e rakhi
const KEY = "apon-bazar-my-orders";

export function getMyOrderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addMyOrderId(id: string) {
  const ids = getMyOrderIds();
  localStorage.setItem(KEY, JSON.stringify([id, ...ids]));
}