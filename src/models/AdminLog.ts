import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const AdminLogSchema = new Schema(
  { message: { type: String, required: true } },
  { timestamps: true }
);

export type AdminLogType = InferSchemaType<typeof AdminLogSchema>;

const AdminLog =
  (mongoose.models.AdminLog as Model<AdminLogType>) ||
  mongoose.model("AdminLog", AdminLogSchema);

export default AdminLog;