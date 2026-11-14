import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    emoji: { type: String },
    unit: { type: String },
    price: { type: Number, required: true },
    costPrice: { type: Number, default: 0 }, // seller er profit hishab er jonno
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    shopName: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    total: { type: Number, required: true },
    deliveryType: { type: String, enum: ["home", "pickup"], default: "home" },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    statusIndex: { type: Number, default: 0, min: 0, max: 4 },
    statusHistory: { type: [Date], default: [] },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    paymentMethod: { type: String, default: "Cash on Delivery" },
    transactionId: { type: String, default: "" },
    stripeSessionId: { type: String, default: "" },
    cancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export type OrderType = InferSchemaType<typeof OrderSchema>;

const Order =
  (mongoose.models.Order as Model<OrderType>) || mongoose.model("Order", OrderSchema);

export default Order;