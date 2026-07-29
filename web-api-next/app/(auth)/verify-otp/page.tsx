"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/lib/api/auth";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEmail(sessionStorage.getItem("reset_email") || "");
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      sessionStorage.setItem("reset_otp", otp);
      router.push("/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
        <p className="mt-2 text-sm text-gray-600">Enter the six-digit code sent to your email.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-6 block text-sm font-medium text-gray-700" htmlFor="otp">OTP</label>
        <input id="otp" inputMode="numeric" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 tracking-widest" />
        <button disabled={hydrated && (loading || !email)} className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300">
          {loading ? "Verifying..." : "Verify code"}
        </button>
      </form>
    </main>
  );
}
