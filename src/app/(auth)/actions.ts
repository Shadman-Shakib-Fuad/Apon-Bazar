"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function loginAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) return "Email ba password thik na.";
    throw error; // redirect ei error diye hoy, tai abar throw korte hobe
  }
  return null;
}

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
  // Admin role ekhane nai, user nijer theke Admin hote parbe na
  role: z.enum(["customer", "seller"]),
});

export async function registerAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return "Naam, thik email ar kom pokkhe 6 character er password dao.";
  const { name, email, password, role } = parsed.data;

  await connectDB();
  if (await User.exists({ email })) return "Ei email diye already account ache.";

  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash, role, provider: "credentials" });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: role === "seller" ? "/open-shop" : "/",
    });
  } catch (error) {
    if (error instanceof AuthError) return "Account hoyeche, kintu login hoyni. Login page e jao.";
    throw error;
  }
  return null;
}