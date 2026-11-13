"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { loginAction, googleLoginAction } from "../actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null);

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Store size={22} />
          </span>
          <span className="text-xl font-bold text-primary-dark">Apon Bazar</span>
        </Link>

        <h1 className="text-center text-2xl font-extrabold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Account e login koro</p>

        <form action={googleLoginAction} className="mt-6">
          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" /> OR <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form action={formAction} className="space-y-3">
          <input name="email" type="email" required placeholder="Email" className={input} />
          <input name="password" type="password" required placeholder="Password" className={input} />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button
            disabled={pending}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {pending ? "Login hocche..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Account nai?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register koro
          </Link>
        </p>
      </div>
    </div>
  );
}