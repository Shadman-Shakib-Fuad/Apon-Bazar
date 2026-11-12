"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Shop, { ShopDoc } from "@/models/Shop";
import Report from "@/models/Report";
import AdminLog from "@/models/AdminLog";

type Result = { ok: true } | { ok: false; error: string };

export async function toggleShopStatus(shopId: string): Promise<Result> {
  if (!mongoose.isValidObjectId(shopId)) return { ok: false, error: "Shop paoa jayni." };
  await connectDB();

  const shop = await Shop.findById(shopId).lean<ShopDoc>();
  if (!shop) return { ok: false, error: "Shop paoa jayni." };

  const next = shop.status === "active" ? "restricted" : "active";
  await Shop.updateOne({ _id: shopId }, { status: next });
  await AdminLog.create({
    message: `Admin ${next === "restricted" ? "restricted" : "unrestricted"} "${shop.name}"`,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function handleReport(
  reportId: string,
  action: "restrict" | "dismiss"
): Promise<Result> {
  if (!mongoose.isValidObjectId(reportId)) return { ok: false, error: "Report paoa jayni." };
  await connectDB();

  const report = await Report.findById(reportId);
  if (!report) return { ok: false, error: "Report paoa jayni." };

  if (action === "restrict") {
    await Shop.updateOne({ _id: report.shopId }, { status: "restricted" });
    report.status = "resolved";
    await AdminLog.create({
      message: `Admin restricted "${report.shopName}" (report by ${report.reporterName})`,
    });
  } else {
    report.status = "dismissed";
    await AdminLog.create({
      message: `Admin dismissed report by ${report.reporterName} against "${report.shopName}"`,
    });
  }
  await report.save();

  revalidatePath("/", "layout");
  return { ok: true };
}