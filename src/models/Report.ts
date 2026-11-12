import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const ReportSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    shopName: { type: String, required: true },
    reporterName: { type: String, required: true },
    reason: {
      type: String,
      enum: ["Fake product", "Bad behavior", "Wrong price", "Other"],
      required: true,
    },
    description: { type: String, default: "" },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

export type ReportType = InferSchemaType<typeof ReportSchema>;

const Report =
  (mongoose.models.Report as Model<ReportType>) || mongoose.model("Report", ReportSchema);

export default Report;