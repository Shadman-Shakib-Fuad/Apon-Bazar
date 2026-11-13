"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/(main)/profile/actions";

export default function ProfileForm({
  name,
  phone,
  address,
}: {
  name: string;
  phone: string;
  address: string;
}) {
  const [msg, formAction, pending] = useActionState(updateProfile, null);

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <form action={formAction} className="space-y-3">
      <input name="name" required defaultValue={name} placeholder="Full name" className={input} />
      <input name="phone" defaultValue={phone} placeholder="Phone number" className={input} />
      <textarea name="address" defaultValue={address} rows={3} placeholder="Address" className={input} />
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      <button
        disabled={pending}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}