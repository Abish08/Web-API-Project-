"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await forgotPassword({ email });
      sessionStorage.setItem("reset_email", email);
      setMessage(result.message || "If the email exists, a reset code has been sent.");
      router.push("/verify-otp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-gray-600">Enter your email and we&apos;ll send a six-digit reset code if the account exists.</p>
        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <label className="mt-6 block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3" />
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300">
          {loading ? "Sending..." : "Send reset code"}
        </button>
        <Link href="/login" className="mt-4 block text-center text-sm text-green-700">Back to login</Link>
      </form>
    </main>
  );
}
