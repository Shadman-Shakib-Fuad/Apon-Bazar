import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const ShopSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true },
    area: { type: String, required: true },
    emoji: { type: String, default: "🏪" },
    status: { type: String, enum: ["active", "restricted"], default: "active" },
    deliveryCharge: { type: Number, default: 30, min: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ShopType = InferSchemaType<typeof ShopSchema>;
export type ShopDoc = ShopType & { _id: Types.ObjectId };

const Shop =
  (mongoose.models.Shop as Model<ShopType>) || mongoose.model("Shop", ShopSchema);

export default Shop;