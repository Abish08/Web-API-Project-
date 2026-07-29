"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { handleChangePassword } from "@/lib/actions/auth-action";
import { z } from "zod";
import Link from "next/link";
import { getErrorMessage } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Password change failed");
      alert(message);
      setError(message);
    }
  };

  const inputClass = "nn-focus-ring h-11 w-full rounded-lg border border-green-100 bg-white px-3 text-slate-950";

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Account Security</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Change Password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Update your password using the current account security flow.
          </p>
        </div>
        <Link href="/profile" className="nn-focus-ring rounded-full px-3 py-2 text-sm font-bold text-green-900 hover:bg-green-100">
          Back to Profile
        </Link>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-950">Current Password</label>
          <input type="password" {...register("oldPassword")} className={inputClass} />
          {errors.oldPassword ? <p className="mt-1 text-sm text-red-600">{errors.oldPassword.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-950">New Password</label>
          <input type="password" {...register("newPassword")} className={inputClass} />
          {errors.newPassword ? <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-950">Confirm New Password</label>
          <input type="password" {...register("confirmPassword")} className={inputClass} />
          {errors.confirmPassword ? <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p> : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </Card>
  );
}
