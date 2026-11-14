import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

type Payload = { title: string; message: string; link?: string };

export async function notify(userId: string, p: Payload) {
  if (!mongoose.isValidObjectId(userId)) return;
  await connectDB();
  await Notification.create({
    userId,
    title: p.title,
    message: p.message,
    link: p.link ?? "",
  });
}

export async function notifyMany(userIds: string[], p: Payload) {
  const ids = Array.from(new Set(userIds)).filter((id) => mongoose.isValidObjectId(id));
  if (ids.length === 0) return;
  await connectDB();
  await Notification.insertMany(
    ids.map((userId) => ({ userId, title: p.title, message: p.message, link: p.link ?? "" }))
  );
}