import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const ProductSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 }, // selling price
    costPrice: { type: Number, required: true, min: 0 }, // seller er kena dam
    yesterdayPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    emoji: { type: String, default: "📦" },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type ProductType = InferSchemaType<typeof ProductSchema>;
export type ProductDoc = ProductType & { _id: Types.ObjectId };

const Product =
  (mongoose.models.Product as Model<ProductType>) || mongoose.model("Product", ProductSchema);

export default Product;