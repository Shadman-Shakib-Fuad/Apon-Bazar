"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import User from "@/models/User";

export async function updateProfile(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return "Please log in.";

  const parsed = z
    .object({
      name: z.string().trim().min(2).max(60),
      phone: z.string().trim().max(20),
      address: z.string().trim().max(250),
    })
    .safeParse({
      name: formData.get("name"),
      phone: formData.get("phone") ?? "",
      address: formData.get("address") ?? "",
    });
  if (!parsed.success) return "Please enter a valid name.";

  await connectDB();
  await User.updateOne({ _id: user.id }, parsed.data);
  revalidatePath("/", "layout");
  return "Profile updated ✅";
}

// Customer, seller hote pare. Admin role eibhabe paoa jay na
export async function becomeSeller() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "customer") {
    await connectDB();
    await User.updateOne({ _id: user.id }, { role: "seller" });
  }
  redirect("/open-shop");
}