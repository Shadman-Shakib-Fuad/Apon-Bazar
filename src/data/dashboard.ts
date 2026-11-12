// ---------- Seller (Rahim Vegetable Store = s1) ----------
export const sellerShopId = "s1";

export const dailySales = [
  { day: "Mon", revenue: 4200, cost: 3300 },
  { day: "Tue", revenue: 5100, cost: 4000 },
  { day: "Wed", revenue: 3800, cost: 4100 }, // loss day
  { day: "Thu", revenue: 6200, cost: 4700 },
  { day: "Fri", revenue: 7000, cost: 5300 },
  { day: "Sat", revenue: 8400, cost: 6200 },
  { day: "Sun", revenue: 6900, cost: 5100 },
].map((d) => ({ ...d, profit: d.revenue - d.cost }));

export type SellerProduct = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unit: string;
  price: number;
  costPrice: number;
  stock: number;
  sold: number;
};

export const sellerProducts: SellerProduct[] = [
  { id: "p1", name: "Fresh Tomato", emoji: "🍅", category: "Vegetables", unit: "per kg", price: 60, costPrice: 48, stock: 50, sold: 120 },
  { id: "p2", name: "Potato", emoji: "🥔", category: "Vegetables", unit: "per kg", price: 45, costPrice: 36, stock: 120, sold: 210 },
  { id: "p3", name: "Green Chili", emoji: "🌶️", category: "Vegetables", unit: "per kg", price: 120, costPrice: 100, stock: 30, sold: 45 },
  { id: "p4", name: "Banana", emoji: "🍌", category: "Fruits", unit: "per dozen", price: 80, costPrice: 62, stock: 40, sold: 88 },
  { id: "p5", name: "Watermelon", emoji: "🍉", category: "Fruits", unit: "per kg", price: 55, costPrice: 40, stock: 0, sold: 30 },
];

// ---------- Admin ----------
export const adminStats = {
  users: 1280,
  shops: 5,
  orders: 3842,
  sales: 1245820,
};

export type AdminShop = {
  id: string;
  name: string;
  owner: string;
  rating: number;
  reviews: number;
  reports: number;
  sales: number;
  status: "active" | "restricted";
};

export const adminShops: AdminShop[] = [
  { id: "s1", name: "Rahim Vegetable Store", owner: "Abdur Rahim", rating: 4.7, reviews: 128, reports: 0, sales: 312000, status: "active" },
  { id: "s2", name: "Fresh Fish Corner", owner: "Jamal Hossain", rating: 4.5, reviews: 96, reports: 3, sales: 268000, status: "active" },
  { id: "s3", name: "Madina Grocery", owner: "Md Salim", rating: 4.3, reviews: 210, reports: 1, sales: 412000, status: "active" },
  { id: "s4", name: "Dairy Fresh House", owner: "Rubel Mia", rating: 4.8, reviews: 75, reports: 0, sales: 198000, status: "active" },
  { id: "s5", name: "Sunrise Mart", owner: "Tarek Aziz", rating: 2.1, reviews: 54, reports: 5, sales: 55820, status: "active" },
];

export type Report = {
  id: string;
  reporter: string;
  shopId: string;
  shopName: string;
  reason: string;
  description: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
};

export const initialReports: Report[] = [
  { id: "r1", reporter: "Karim Uddin", shopId: "s5", shopName: "Sunrise Mart", reason: "Fake product", description: "The product was not original as shown in the photo.", date: "2026-11-09", status: "pending" },
  { id: "r2", reporter: "Nusrat Jahan", shopId: "s5", shopName: "Sunrise Mart", reason: "Wrong price", description: "Charged more than the price shown on the website.", date: "2026-11-09", status: "pending" },
  { id: "r3", reporter: "Sabbir Hossain", shopId: "s2", shopName: "Fresh Fish Corner", reason: "Bad behavior", description: "Seller was rude when I asked for a refund.", date: "2026-11-08", status: "pending" },
  { id: "r4", reporter: "Mitu Akter", shopId: "s5", shopName: "Sunrise Mart", reason: "Fake product", description: "Expired item delivered.", date: "2026-11-07", status: "pending" },
  { id: "r5", reporter: "Rashed Khan", shopId: "s3", shopName: "Madina Grocery", reason: "Wrong price", description: "Price changed after I placed the order.", date: "2026-11-06", status: "pending" },
];