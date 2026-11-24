import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

// GeoJSON point: coordinates = [longitude, latitude]
const PointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const ShopSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true },
    area: { type: String, required: true },
    emoji: { type: String, default: "🏪" },
    status: { type: String, enum: ["active", "restricted"], default: "active" },
    deliveryCharge: { type: Number, default: 30, min: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // Shop er map location. Seller na dile faka thake
    location: { type: PointSchema },
  },
  { timestamps: true }
);

// Kache er shop khujar jonno (MongoDB nijei index toiri kore nebe)
ShopSchema.index({ location: "2dsphere" });

export type ShopType = InferSchemaType<typeof ShopSchema>;
export type ShopDoc = ShopType & { _id: Types.ObjectId };

const Shop =
  (mongoose.models.Shop as Model<ShopType>) || mongoose.model("Shop", ShopSchema);

export default Shop;