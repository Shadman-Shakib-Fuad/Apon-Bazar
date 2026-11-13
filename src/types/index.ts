export type ShopView = {
  id: string;
  name: string;
  area: string;
  emoji: string;
  status: "active" | "restricted";
  deliveryCharge: number;
  rating: number;
  reviewCount: number;
};

// Customer ke dekhano product (costPrice ekhane nai)
export type ProductView = {
  id: string;
  shopId: string;
  shopName: string;
  shopEmoji: string;
  shopStatus: "active" | "restricted";
  deliveryCharge: number;
  name: string;
  category: string;
  price: number;
  yesterdayPrice: number;
  unit: string;
  emoji: string;
  stock: number;
};

export type OrderItemView = {
  productId: string;
  name: string;
  emoji: string;
  unit: string;
  price: number;
  qty: number;
};

export type OrderView = {
  id: string;
  code: string;
  userId: string;
  shopId: string;
  shopName: string;
  items: OrderItemView[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  deliveryType: "home" | "pickup";
  customerName: string;
  phone: string;
  address: string;
  statusIndex: number;
  history: string[];
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
};

export type ReviewView = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

// Shudhu seller/admin dekhbe (costPrice shoho)
export type SellerProductView = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unit: string;
  price: number;
  costPrice: number;
  stock: number;
};

export type AdminShopView = {
  id: string;
  name: string;
  owner: string;
  rating: number;
  reviewCount: number;
  pendingReports: number;
  sales: number;
  status: "active" | "restricted";
};

export type ReportView = {
  id: string;
  shopId: string;
  shopName: string;
  reporterName: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  date: string;
};

export type AdminLogView = {
  id: string;
  message: string;
  time: string;
};