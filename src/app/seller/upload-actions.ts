"use server";

import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/session";

type Signature =
  | {
      ok: true;
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    }
  | { ok: false; error: string };

// Shudhu seller photo upload korte parbe. Browser shorashori Cloudinary te pathay,
// ei signature ta proof je upload er permission ache
export async function getUploadSignature(): Promise<Signature> {
  const user = await getCurrentUser();
  if (!user || user.role !== "seller") {
    return { ok: false, error: "Only sellers can upload images." };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: "Image upload is not configured yet." };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "apon-bazar/products";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return { ok: true, cloudName, apiKey, timestamp, folder, signature };
}