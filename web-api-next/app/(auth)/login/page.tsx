"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormSchema, type LoginFormDataType } from "../_components/schema";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { getErrorMessage } from "@/lib/api/types";
import Image from "next/image";

export default function LoginPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormDataType>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onFormSubmit = (formData: LoginFormDataType) => {
    setErrorMessage("");
    startTransition(async () => {
      try {
        const result = await handleLoginUser({ ...formData, email: formData.email.trim().toLowerCase() });
        if (result.success) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setErrorMessage(result.message || "Login failed");
        }
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, "Login failed"));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-6 flex justify-center"><Image src="/image.png" alt="NutriNepal" width={240} height={240} className="h-32 w-48 object-contain" priority /></div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            Professional nutrition tracking at your fingertips.
          </p>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition"
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" /><span>OR</span><span className="h-px flex-1 bg-gray-200" />
          </div>
          <a href={`${apiBaseUrl}/api/v1/auth/google`} className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-100">
            <span className="text-lg font-bold text-blue-600">G</span>Continue with Google
          </a>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-orange-600 font-semibold hover:text-orange-700">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
