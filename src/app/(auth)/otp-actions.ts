"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { HydratedDocument } from "mongoose";
import { signIn } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { sendOtpEmail } from "@/lib/mail";
import {
  generateCode,
  hashCode,
  codesMatch,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_ATTEMPTS,
} from "@/lib/otp";
import User from "@/models/User";
import Otp, { OtpType } from "@/models/Otp";

type Result = { ok: true } | { ok: false; error: string };
type Purpose = "register" | "reset";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const codeSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code.");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(72, "Password is too long.");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(60),
  email: emailSchema,
  password: passwordSchema,
  // Admin ekhane nai, user nijer theke Admin hote parbe na
  role: z.enum(["customer", "seller"]),
});

function secondsLeft(lastSentAt: Date) {
  const wait = RESEND_COOLDOWN_MS - (Date.now() - lastSentAt.getTime());
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
}

// Notun code banay, save kore, email e pathay
async function issueCode(
  email: string,
  purpose: Purpose,
  extra: Record<string, unknown> = {}
): Promise<Result> {
  const code = generateCode();
  const now = new Date();

  await Otp.findOneAndUpdate(
    { email, purpose },
    {
      $set: {
        codeHash: hashCode(email, purpose, code),
        attempts: 0,
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        lastSentAt: now,
        ...extra,
      },
    },
    { upsert: true }
  );

  try {
    await sendOtpEmail(email, code, purpose);
    return { ok: true };
  } catch {
    await Otp.deleteOne({ email, purpose });
    return { ok: false, error: "We could not send the email. Please try again later." };
  }
}

// Code thik ki na dekhe. Thik hole null, bhul hole error message dey
async function validateCode(
  doc: HydratedDocument<OtpType> | null,
  email: string,
  purpose: Purpose,
  code: string
): Promise<Result | null> {
  if (!doc || doc.expiresAt.getTime() < Date.now()) {
    if (doc) await doc.deleteOne();
    return { ok: false, error: "This code has expired. Please request a new one." };
  }
  if (doc.attempts >= MAX_ATTEMPTS) {
    await doc.deleteOne();
    return { ok: false, error: "Too many wrong attempts. Please request a new code." };
  }
  if (!codesMatch(doc.codeHash, hashCode(email, purpose, code))) {
    doc.attempts += 1;
    await doc.save();
    const left = MAX_ATTEMPTS - doc.attempts;
    if (left <= 0) {
      await doc.deleteOne();
      return { ok: false, error: "Too many wrong attempts. Please request a new code." };
    }
    return { ok: false, error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` };
  }
  return null;
}

// ---------------- Registration ----------------

export async function startRegistration(input: unknown): Promise<Result> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { name, email, password, role } = parsed.data;

  await connectDB();
  if (await User.exists({ email })) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const existing = await Otp.findOne({ email, purpose: "register" });
  if (existing) {
    const wait = secondsLeft(existing.lastSentAt);
    if (wait > 0) {
      return { ok: false, error: `Please wait ${wait} seconds before requesting another code.` };
    }
  }

  return issueCode(email, "register", {
    pendingName: name,
    pendingPasswordHash: await bcrypt.hash(password, 10),
    pendingRole: role,
  });
}

export async function resendRegistrationCode(emailInput: string): Promise<Result> {
  const parsed = emailSchema.safeParse(emailInput);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  const email = parsed.data;

  await connectDB();
  const doc = await Otp.findOne({ email, purpose: "register" });
  if (!doc) return { ok: false, error: "Your sign-up session expired. Please start again." };

  const wait = secondsLeft(doc.lastSentAt);
  if (wait > 0) {
    return { ok: false, error: `Please wait ${wait} seconds before requesting another code.` };
  }

  return issueCode(email, "register");
}

export async function verifyRegistration(
  emailInput: string,
  codeInput: string,
  password: string
): Promise<Result> {
  const email = emailSchema.safeParse(emailInput);
  const code = codeSchema.safeParse(codeInput);
  if (!email.success) return { ok: false, error: "Enter a valid email address." };
  if (!code.success) return { ok: false, error: code.error.issues[0].message };

  await connectDB();
  const doc = await Otp.findOne({ email: email.data, purpose: "register" });
  const problem = await validateCode(doc, email.data, "register", code.data);
  if (problem || !doc) return problem ?? { ok: false, error: "Please try again." };

  if (await User.exists({ email: email.data })) {
    await doc.deleteOne();
    return { ok: false, error: "An account with this email already exists." };
  }

  const role = doc.pendingRole ?? "customer";
  await User.create({
    name: doc.pendingName ?? "User",
    email: email.data,
    password: doc.pendingPasswordHash,
    role,
    provider: "credentials",
  });
  await doc.deleteOne();

  try {
    await signIn("credentials", {
      email: email.data,
      password,
      redirectTo: role === "seller" ? "/open-shop" : "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Your email is verified. Please log in." };
    }
    throw error; // redirect ei error diye hoy
  }
  return { ok: true };
}

// ---------------- Password reset ----------------

export async function requestPasswordReset(emailInput: string): Promise<Result> {
  const parsed = emailSchema.safeParse(emailInput);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  const email = parsed.data;

  await connectDB();
  const user = await User.findOne({ email }).select("+password");

  // Account ache kina keu jate bujhte na pare, tai sob shomoy ekoi uttor dei.
  // Google diye khola account e password nai, tai code pathai na
  if (user && user.password && user.isActive) {
    const existing = await Otp.findOne({ email, purpose: "reset" });
    if (!existing || secondsLeft(existing.lastSentAt) === 0) {
      const sent = await issueCode(email, "reset");
      if (!sent.ok) return sent;
    }
  }
  return { ok: true };
}

const resetSchema = z.object({
  email: emailSchema,
  code: codeSchema,
  password: passwordSchema,
});

export async function resetPassword(input: unknown): Promise<Result> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { email, code, password } = parsed.data;

  await connectDB();
  const doc = await Otp.findOne({ email, purpose: "reset" });
  const problem = await validateCode(doc, email, "reset", code);
  if (problem || !doc) return problem ?? { ok: false, error: "Please try again." };

  await User.updateOne({ email }, { password: await bcrypt.hash(password, 10) });
  await doc.deleteOne();
  return { ok: true };
}