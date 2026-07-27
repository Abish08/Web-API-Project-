"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleUpdateUser } from "@/lib/actions/admin/user-action";
import { getErrorMessage, User } from "@/lib/api/types";

const fieldClass = "h-12 w-full border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500 rounded-md";
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-gray-700";

export default function UserFormEdit({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    role: user?.role || "user",
    password: "", // Leave blank to keep existing password
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    startTransition(async () => {
      try {
        // Use FormData because backend expects multipart/form-data for image upload
        const formdata = new FormData();
        formdata.append("firstName", formData.firstName);
        formdata.append("lastName", formData.lastName);
        formdata.append("email", formData.email);
        formdata.append("username", formData.username);
        formdata.append("role", formData.role);
        if (formData.password) formdata.append("password", formData.password);
        if (imageFile) formdata.append("profileImage", imageFile);

        const result = await handleUpdateUser(user._id, formdata);
        if (!result.success) throw new Error(result.message);
        alert("User updated successfully");
        router.push("/admin/users");
        router.refresh();
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Something went wrong"));
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={onSubmit}>
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className={labelClass}>Profile Image</label>
          <input type="file" onChange={handleImageChange} accept="image/*" className="text-sm text-gray-600" />
          {user?.profileImage && !imageFile && (
            <p className="mt-2 text-xs text-gray-500">Current image: {user.profileImage}</p>
          )}
        </div>

        <div className="mb-5">
          <label className={labelClass}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className={fieldClass} />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={fieldClass} />
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required className={fieldClass} />
        </div>

        <div className="mb-5">
          <label className={labelClass}>Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className={fieldClass}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mb-5">
          <label className={labelClass}>New Password (leave blank to keep current)</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={fieldClass} />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center bg-gray-900 text-xs font-bold uppercase tracking-[1.5px] text-white transition-opacity hover:opacity-90 disabled:opacity-50 rounded-md"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
