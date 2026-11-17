import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const OtpSchema = new Schema(
  {
    email: { type: String, required: true },
    purpose: { type: String, enum: ["register", "reset"], required: true },
    codeHash: { type: String, required: true }, // asol code na, shudhu hash save hoy
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    lastSentAt: { type: Date, required: true },

    // Shudhu registration er jonno: code verify na hoa porjonto account banay na,
    // tai ekhane shomoyik rakhi
    pendingName: { type: String },
    pendingPasswordHash: { type: String },
    pendingRole: { type: String, enum: ["customer", "seller"] },
  },
  { timestamps: true }
);

// Ek email + ek kaj er jonno ekta-i code
OtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
// Shomoy shesh hole MongoDB nijei muche dey
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpType = InferSchemaType<typeof OtpSchema>;

const Otp = (mongoose.models.Otp as Model<OtpType>) || mongoose.model("Otp", OtpSchema);

export default Otp;