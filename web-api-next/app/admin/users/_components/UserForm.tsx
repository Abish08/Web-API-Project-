"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleCreateUser } from "@/lib/actions/admin/user-action";

const fieldClass = "h-12 w-full border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500 rounded-md";
const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-gray-700";
const errClass = "mt-1 block text-sm text-red-600";

export default function UserForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    role: "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    startTransition(async () => {
      try {
        const result = await handleCreateUser(formData);
        if (!result.success) throw new Error(result.message);
        alert("User created successfully");
        router.push("/admin/users");
        router.refresh();
      } catch (err: any) {
        setError(err?.message || "Something went wrong");
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
          <label className={labelClass}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className={fieldClass} />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Jane" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className={fieldClass} />
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="janedoe" className={fieldClass} />
        </div>

        <div className="mb-5">
          <label className={labelClass}>Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className={fieldClass}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className={fieldClass} />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center bg-gray-900 text-xs font-bold uppercase tracking-[1.5px] text-white transition-opacity hover:opacity-90 disabled:opacity-50 rounded-md"
        >
          {isPending ? "Creating..." : "Create user"}
        </button>
      </form>
    </div>
  );
}