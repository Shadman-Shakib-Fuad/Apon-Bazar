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

// Customer ke dekhano product (costPrice ekhane nai, eta shudhu seller/admin dekhbe)
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