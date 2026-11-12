import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const ReviewSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ReviewType = InferSchemaType<typeof ReviewSchema>;

const Review =
  (mongoose.models.Review as Model<ReviewType>) || mongoose.model("Review", ReviewSchema);

export default Review;