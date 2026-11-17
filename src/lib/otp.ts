import crypto from "node:crypto";

export const OTP_TTL_MS = 10 * 60 * 1000; // code 10 minute valid
export const RESEND_COOLDOWN_MS = 60 * 1000; // notun code chaite 60 second opekkha
export const MAX_ATTEMPTS = 5; // 5 bar bhul korle code bondho

export function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashCode(email: string, purpose: string, code: string) {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${email}:${purpose}:${code}`)
    .digest("hex");
}

export function codesMatch(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}