import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const PriceHistorySchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
});

export type PriceHistoryType = InferSchemaType<typeof PriceHistorySchema>;

const PriceHistory =
  (mongoose.models.PriceHistory as Model<PriceHistoryType>) ||
  mongoose.model("PriceHistory", PriceHistorySchema);

export default PriceHistory;