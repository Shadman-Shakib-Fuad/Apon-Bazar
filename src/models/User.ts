import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, // Google login e password thakbe na
    image: { type: String },
    phone: { type: String },
    address: { type: String },
    role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof UserSchema>;

const User =
  (mongoose.models.User as Model<UserType>) ||
  mongoose.model<UserType>("User", UserSchema);

export default User;