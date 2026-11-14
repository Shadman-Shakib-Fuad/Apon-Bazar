export function formatPrice(n: number) {
  return `৳${n.toLocaleString("en-US")}`;
}

export function priceDiff(price: number, yesterday: number) {
  return price - yesterday;
}

// Demo price history (pore database theke asbe)
export function getPriceHistory(price: number, yesterday: number) {
  const step = Math.max(1, Math.round(price * 0.02));
  const offsets = [-2, 1, -1, 2, 0];
  const values = [...offsets.map((o) => yesterday + o * step), yesterday, price];

  const points = values.map((value, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (values.length - 1 - i));
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      price: value,
    };
  });

  let ups = 0;
  let downs = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) ups++;
    else if (values[i] < values[i - 1]) downs++;
  }

  return { points, ups, downs };
}

// Rating 3 er niche ba 5+ pending report hole "Under review"
export function isUnderReview(s: {
  rating: number;
  reviewCount: number;
  pendingReports: number;
}) {
  return (s.reviewCount > 0 && s.rating < 3) || s.pendingReports >= 5;
}

// Stock ei number er niche gele seller ke "low stock" alert jabe
export const LOW_STOCK = 30;