"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import Notification from "@/models/Notification";

export async function markAllRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await connectDB();
  await Notification.updateMany({ userId: user.id, read: false }, { read: true });
  revalidatePath("/", "layout");
}