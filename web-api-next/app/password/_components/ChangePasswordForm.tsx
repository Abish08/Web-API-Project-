"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { handleChangePassword } from "@/lib/actions/auth-action";
import { z } from "zod";
import Link from "next/link";

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Minimum 6 characters"),
    newPassword: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ChangePasswordData) => {
    setError(null);
    try {
      const response = await handleChangePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      if (!response.success) {
        throw new Error(response.message || "Change password failed");
      }
      alert("Password changed successfully");
      reset();
    } catch (error: any) {
      alert(error.message || "Password change failed");
      setError(error.message || "Password change failed");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Change Password</h1>
        <Link href="/profile" className="text-blue-600 hover:text-blue-700 text-sm">
          ← Back to Profile
        </Link>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            type="password"
            {...register("oldPassword")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.oldPassword && <p className="text-sm text-red-600 mt-1">{errors.oldPassword.message}</p>}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            {...register("newPassword")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
        >
          {isSubmitting ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}