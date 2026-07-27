"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEmail(sessionStorage.getItem("reset_email") || "");
      setOtp(sessionStorage.getItem("reset_otp") || "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-2 text-sm text-gray-600">Choose a new password for your NutriNepal account.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-6 block text-sm font-medium text-gray-700" htmlFor="password">New password</label>
        <input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3" />
        <label className="mt-4 block text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm password</label>
        <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3" />
        <button disabled={loading || !email || !otp} className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300">
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </main>
  );
}
