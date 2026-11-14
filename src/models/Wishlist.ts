import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

// Ek user ek product duibar wishlist e rakhte parbe na
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type WishlistType = InferSchemaType<typeof WishlistSchema>;

const Wishlist =
  (mongoose.models.Wishlist as Model<WishlistType>) ||
  mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;