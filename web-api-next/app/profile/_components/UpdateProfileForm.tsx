"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { z } from "zod";
import Link from "next/link";
import { getErrorMessage, User } from "@/lib/api/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, { message: "Minimum 2 characters" }),
  lastName: z.string().min(2, { message: "Minimum 2 characters" }),
  email: z.string().email("Invalid email"),
  username: z.string().min(3, { message: "Minimum 3 characters" }),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: "Max file size is 5MB",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png, .webp and .avif formats are supported",
    }),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export default function UpdateProfileForm({ user }: { user: User }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
    onChange(file);
  };

  const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
    setPreviewImage(null);
    onChange?.(undefined);
  };

  const onSubmit = async (data: UpdateProfileData) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("username", data.username);
      if (data.image) {
        formData.append("image", data.image);
      }
      const response = await handleUpdateProfile(formData);
      if (!response.success) {
        throw new Error(response.message || "Update profile failed");
      }
      handleDismissImage();
      alert("Profile updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Profile update failed");
      alert(message);
      setError(message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Update Profile</h1>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

        {/* Profile Image Preview */}
        <div className="flex justify-center mb-6">
          {previewImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- Preview image is a local data URL before upload. */}
              <img
                src={previewImage}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange } }) => (
                  <button
                    type="button"
                    onClick={() => handleDismissImage(onChange)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-blue-500">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Profile Image Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange } }) => (
              <input
                type="file"
                onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                accept=".jpg,.jpeg,.png,.webp,.avif"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          />
          {errors.image && <p className="text-sm text-red-600 mt-1">{errors.image.message}</p>}
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            {...register("firstName")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            {...register("lastName")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            {...register("username")}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
          {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg transition"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>

        <div className="text-center pt-4 border-t">
          <Link href="/password" className="text-blue-600 hover:text-blue-700 text-sm">
            Change Password →
          </Link>
        </div>
      </form>
    </div>
  );
}
