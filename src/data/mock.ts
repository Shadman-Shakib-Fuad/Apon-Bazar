export const categories = [
  { name: "Vegetables", emoji: "🥬" },
  { name: "Fruits", emoji: "🍉" },
  { name: "Fish", emoji: "🐟" },
  { name: "Dairy", emoji: "🥛" },
  { name: "Grocery", emoji: "🛒" },
  { name: "Bakery", emoji: "🍞" },
];

export type Shop = {
  id: string;
  name: string;
  area: string;
  rating: number;
  reviews: number;
  emoji: string;
  status: "active" | "restricted";
  deliveryCharge: number;
};

export type Product = {
  id: string;
  shopId: string;
  name: string;
  category: string;
  price: number;
  yesterdayPrice: number;
  unit: string;
  emoji: string;
  stock: number;
};

export const shops: Shop[] = [
  { id: "s1", name: "Rahim Vegetable Store", area: "Main Bazar", rating: 4.7, reviews: 128, emoji: "🥬", status: "active", deliveryCharge: 30 },
  { id: "s2", name: "Fresh Fish Corner", area: "Station Road", rating: 4.5, reviews: 96, emoji: "🐟", status: "active", deliveryCharge: 40 },
  { id: "s3", name: "Madina Grocery", area: "College Gate", rating: 4.3, reviews: 210, emoji: "🛒", status: "active", deliveryCharge: 30 },
  { id: "s4", name: "Dairy Fresh House", area: "New Market", rating: 4.8, reviews: 75, emoji: "🥛", status: "active", deliveryCharge: 35 },
];

export const products: Product[] = [
  { id: "p1", shopId: "s1", name: "Fresh Tomato", category: "Vegetables", price: 60, yesterdayPrice: 55, unit: "per kg", emoji: "🍅", stock: 50 },
  { id: "p2", shopId: "s1", name: "Potato", category: "Vegetables", price: 45, yesterdayPrice: 45, unit: "per kg", emoji: "🥔", stock: 120 },
  { id: "p3", shopId: "s1", name: "Green Chili", category: "Vegetables", price: 120, yesterdayPrice: 140, unit: "per kg", emoji: "🌶️", stock: 30 },
  { id: "p4", shopId: "s1", name: "Banana", category: "Fruits", price: 80, yesterdayPrice: 90, unit: "per dozen", emoji: "🍌", stock: 40 },
  { id: "p5", shopId: "s1", name: "Watermelon", category: "Fruits", price: 55, yesterdayPrice: 45, unit: "per kg", emoji: "🍉", stock: 0 },
  { id: "p6", shopId: "s2", name: "Rui Fish", category: "Fish", price: 320, yesterdayPrice: 300, unit: "per kg", emoji: "🐟", stock: 25 },
  { id: "p7", shopId: "s2", name: "Hilsa (Ilish)", category: "Fish", price: 1500, yesterdayPrice: 1600, unit: "per kg", emoji: "🐠", stock: 10 },
  { id: "p8", shopId: "s3", name: "Miniket Rice", category: "Grocery", price: 72, yesterdayPrice: 70, unit: "per kg", emoji: "🍚", stock: 200 },
  { id: "p9", shopId: "s3", name: "Soybean Oil", category: "Grocery", price: 175, yesterdayPrice: 180, unit: "per litre", emoji: "🫒", stock: 80 },
  { id: "p10", shopId: "s3", name: "Sliced Bread", category: "Bakery", price: 60, yesterdayPrice: 60, unit: "per pack", emoji: "🍞", stock: 35 },
  { id: "p11", shopId: "s4", name: "Fresh Milk", category: "Dairy", price: 95, yesterdayPrice: 95, unit: "per litre", emoji: "🥛", stock: 60 },
  { id: "p12", shopId: "s4", name: "Sweet Yogurt", category: "Dairy", price: 140, yesterdayPrice: 130, unit: "per kg", emoji: "🥣", stock: 20 },
];