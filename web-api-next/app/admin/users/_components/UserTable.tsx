"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Modal from "../../_components/Modal";
import { handleDeleteUser } from "@/lib/actions/admin/user-action";
import { User } from "@/lib/api/types";

type Pagination = {
  page?: number;
  limit?: number;
  totalPages?: number;
  total?: number;
};

export default function UserTable({
  data,
  pagination,
  search,
}: {
  data: User[];
  pagination: Pagination;
  search: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<User | null>(null);

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const setQuery = (next: Record<string, string | number>) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => q.set(k, String(v)));
    router.push(`/admin/users?${q.toString()}`);
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("search") as string;
    setQuery({ search: value ?? "", page: 1 });
  };

  const onDelete = () => {
    if (!target) return;
    startTransition(async () => {
      const result = await handleDeleteUser(target._id);
      if (result.success) {
        alert("User deleted successfully");
        setTarget(null);
      } else {
        alert(result.message || "Failed to delete user");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-600">{total} total</p>
        </div>
        <Link
          href="/admin/users/create"
          className="flex h-10 items-center bg-gray-900 px-4 text-xs font-bold uppercase tracking-[1.5px] text-white transition-opacity hover:opacity-90"
        >
          New user
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={onSearch} className="flex w-full max-w-sm gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search users..."
            className="h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-500"
          />
          <button className="h-10 border border-gray-300 px-4 text-xs font-bold uppercase tracking-[1.5px] text-gray-700 transition-colors hover:text-gray-900">
            Search
          </button>
        </form>

        <label className="flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-gray-600">
          Rows
          <select
            value={limit}
            onChange={(e) => setQuery({ limit: e.target.value, page: 1 })}
            className="h-10 border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none focus:border-gray-500"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-[1px] text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((u) => (
                <tr key={u._id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{u.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs uppercase tracking-[1px] ${
                        u.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs font-medium uppercase tracking-[1px]">
                      <Link href={`/admin/users/${u._id}`} className="text-gray-600 hover:text-gray-900">
                        View
                      </Link>
                      <Link
                        href={`/admin/users/${u._id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setTarget(u)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setQuery({ page: page - 1 })}
            className="h-9 border border-gray-300 px-3 text-xs uppercase tracking-[1px] text-gray-700 transition-colors hover:text-gray-900 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setQuery({ page: page + 1 })}
            className="h-9 border border-gray-300 px-3 text-xs uppercase tracking-[1px] text-gray-700 transition-colors hover:text-gray-900 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)} title="Delete user">
        <p className="mb-6 text-sm text-gray-700">
          Delete{" "}
          <span className="font-bold text-gray-900">
            {target?.firstName} {target?.lastName}
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setTarget(null)}
            className="h-10 border border-gray-300 px-4 text-xs font-bold uppercase tracking-[1.5px] text-gray-700 transition-colors hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isPending}
            className="h-10 bg-red-600 px-4 text-xs font-bold uppercase tracking-[1.5px] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
