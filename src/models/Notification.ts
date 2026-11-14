import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export type NotificationType = InferSchemaType<typeof NotificationSchema>;

const Notification =
  (mongoose.models.Notification as Model<NotificationType>) ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;