import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const ReviewSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
    productName: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ek customer, ek order, ek product e ekbar-i review
ReviewSchema.index(
  { userId: 1, orderId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { productId: { $exists: true } } }
);

export type ReviewType = InferSchemaType<typeof ReviewSchema>;

const Review =
  (mongoose.models.Review as Model<ReviewType>) || mongoose.model("Review", ReviewSchema);

export default Review;