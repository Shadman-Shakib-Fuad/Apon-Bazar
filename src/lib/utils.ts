export function formatPrice(n: number) {
  return `৳${n.toLocaleString("en-US")}`;
}

export function priceDiff(price: number, yesterday: number) {
  return price - yesterday;
}