import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import User from "@/models/User";
import ProfileForm from "@/components/shop/ProfileForm";
import { becomeSeller } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectDB();
  const db = await User.findById(user.id).lean<{
    name: string;
    email: string;
    phone?: string;
    address?: string;
    provider: string;
  }>();
  if (!db) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>

      <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {db.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-bold text-gray-900">{db.name}</p>
            <p className="text-sm text-gray-500">{db.email}</p>
            <div className="mt-1 flex gap-2 text-xs">
              <span className="rounded-full bg-primary-light px-3 py-0.5 font-semibold capitalize text-primary-dark">
                {user.role}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-0.5 capitalize text-gray-600">
                {db.provider} login
              </span>
            </div>
          </div>
        </div>

        <h2 className="mb-3 mt-8 font-bold text-gray-900">Edit profile</h2>
        <ProfileForm name={db.name} phone={db.phone ?? ""} address={db.address ?? ""} />
      </div>

      {user.role === "customer" && (
        <div className="mt-6 rounded-3xl bg-accent-light p-6">
          <h2 className="font-bold text-gray-900">Bring your shop online 🏪</h2>
          <p className="mt-1 text-sm text-gray-600">Become a seller and open a shop to start selling products.</p>
          <form action={becomeSeller}>
            <button className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Become a seller
            </button>
          </form>
        </div>
      )}

      {user.role === "seller" && (
        <Link href="/seller" className="mt-6 block rounded-3xl bg-primary p-5 text-center font-semibold text-white hover:bg-primary-dark">
          Go to Seller Panel
        </Link>
      )}
    </div>
  );
}