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