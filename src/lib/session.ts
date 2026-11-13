import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type Role = "customer" | "seller" | "admin";

export async function getCurrentUser() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return user;
}

// Login na thakle /login e, role mile na hole home e pathay
export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}