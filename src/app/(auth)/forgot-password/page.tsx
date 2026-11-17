"use client";

import { useState, useTransition, FormEvent } from "react";
import Link from "next/link";
import { Store, CheckCircle2 } from "lucide-react";
import { requestPasswordReset, resetPassword } from "../otp-actions";
import CodeInput from "@/components/auth/CodeInput";
import { useCooldown } from "@/components/auth/useCooldown";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useCooldown();

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary";

  function sendCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.ok) {
        setStep("reset");
        setCode("");
        setCooldown(60);
      } else {
        setError(res.error);
      }
    });
  }

  function resend() {
    setError("");
    startTransition(async () => {
      const res = await requestPasswordReset(email);
      if (res.ok) setCooldown(60);
      else setError(res.error);
    });
  }

  function reset(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    startTransition(async () => {
      const res = await resetPassword({ email, code, password });
      if (res.ok) setStep("done");
      else setError(res.error);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <Store size={22} />
          </span>
          <span className="text-xl font-bold text-primary-dark">Apon Bazar</span>
        </Link>

        {step === "email" && (
          <>
            <h1 className="text-center text-2xl font-extrabold text-gray-900">Forgot password?</h1>
            <p className="mt-1 text-center text-sm text-gray-500">
              Enter your email and we will send you a 6-digit code.
            </p>

            <form onSubmit={sendCode} className="mt-6 space-y-3">
              <input required type="email" placeholder="Email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <button
                disabled={pending}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {pending ? "Sending..." : "Send code"}
              </button>
            </form>

            <p className="mt-4 rounded-xl bg-accent-light p-3 text-xs text-gray-600">
              Signed up with Google? You do not have a password. Use Continue with Google on the login page.
            </p>
            <p className="mt-5 text-center text-sm text-gray-500">
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className="text-center text-2xl font-extrabold text-gray-900">Set a new password</h1>
            <p className="mt-2 text-center text-sm text-gray-500">
              If an account exists for {email.trim().toLowerCase()}, we sent a 6-digit code to it.
            </p>

            <form onSubmit={reset} className="mt-6 space-y-3">
              <CodeInput value={code} onChange={setCode} disabled={pending} />
              <input required type="password" minLength={6} placeholder="New password (min 6 characters)" className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
              <input required type="password" minLength={6} placeholder="Confirm new password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} />

              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
              <button
                disabled={pending || code.length !== 6}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {pending ? "Saving..." : "Reset password"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
                className="font-medium text-gray-500 hover:text-gray-800"
              >
                Change email
              </button>
              <button
                type="button"
                disabled={pending || cooldown > 0}
                onClick={resend}
                className="font-semibold text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              Did not get it? Check your spam folder.
            </p>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <CheckCircle2 size={60} className="mx-auto text-green-500" />
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Password updated</h1>
            <p className="mt-1 text-sm text-gray-500">You can now log in with your new password.</p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}