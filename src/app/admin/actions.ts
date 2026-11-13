"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Shop, { ShopDoc } from "@/models/Shop";
import Report from "@/models/Report";
import AdminLog from "@/models/AdminLog";

type Result = { ok: true } | { ok: false; error: string };

async function getAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export async function toggleShopStatus(shopId: string): Promise<Result> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Shudhu admin eta korte pare." };
  if (!mongoose.isValidObjectId(shopId)) return { ok: false, error: "Shop paoa jayni." };
  await connectDB();

  const shop = await Shop.findById(shopId).lean<ShopDoc>();
  if (!shop) return { ok: false, error: "Shop paoa jayni." };

  const next = shop.status === "active" ? "restricted" : "active";
  await Shop.updateOne({ _id: shopId }, { status: next });
  await AdminLog.create({
    message: `${admin.name ?? "Admin"} ${next === "restricted" ? "restricted" : "unrestricted"} "${shop.name}"`,
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function handleReport(
  reportId: string,
  action: "restrict" | "dismiss"
): Promise<Result> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Shudhu admin eta korte pare." };
  if (!mongoose.isValidObjectId(reportId)) return { ok: false, error: "Report paoa jayni." };
  await connectDB();

  const report = await Report.findById(reportId);
  if (!report) return { ok: false, error: "Report paoa jayni." };

  if (action === "restrict") {
    await Shop.updateOne({ _id: report.shopId }, { status: "restricted" });
    report.status = "resolved";
    await AdminLog.create({
      message: `${admin.name ?? "Admin"} restricted "${report.shopName}" (report by ${report.reporterName})`,
    });
  } else {
    report.status = "dismissed";
    await AdminLog.create({
      message: `${admin.name ?? "Admin"} dismissed report by ${report.reporterName} against "${report.shopName}"`,
    });
  }
  await report.save();

  revalidatePath("/", "layout");
  return { ok: true };
}