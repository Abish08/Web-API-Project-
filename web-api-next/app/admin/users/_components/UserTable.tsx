"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Modal from "../../_components/Modal";
import { handleDeleteUser } from "@/lib/actions/admin/user-action";
import { User } from "@/lib/api/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

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
    <div className="w-full space-y-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">User Management</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Registered Members</h2>
          <p className="text-sm text-slate-600">{total} total users</p>
        </div>
        <Link
          href="/admin/users/create"
          className="nn-focus-ring flex h-10 items-center rounded-full bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          New user
        </Link>
      </div>

      <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={onSearch} className="flex w-full max-w-sm gap-2">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search users..."
            className="nn-focus-ring h-10 w-full rounded-lg border border-green-100 bg-white px-3 text-sm text-slate-950"
          />
          <button className="nn-focus-ring h-10 rounded-lg border border-green-100 px-4 text-sm font-bold text-green-950 transition-colors hover:bg-green-50">
            Search
          </button>
        </form>

        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
          Rows
          <select
            value={limit}
            onChange={(e) => setQuery({ limit: e.target.value, page: 1 })}
            className="nn-focus-ring h-10 rounded-lg border border-green-100 bg-white px-2 text-sm text-slate-950"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      </Card>

      <Card className="overflow-hidden border-t-4 border-t-green-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-green-100 bg-green-50 text-xs uppercase tracking-[1px] text-slate-600">
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
                <tr key={u._id} className="border-b border-green-100 last:border-0 hover:bg-green-50">
                  <td className="px-4 py-3 font-bold text-slate-950">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.username}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "admin" ? "warning" : "primary"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs font-bold uppercase tracking-[1px]">
                      <Link href={`/admin/users/${u._id}`} className="text-green-900 hover:text-green-950">
                        View
                      </Link>
                      <Link
                        href={`/admin/users/${u._id}/edit`}
                        className="text-green-900 hover:text-green-950"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setTarget(u)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <EmptyState title="No users found" description="Try adjusting the search term." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setQuery({ page: page - 1 })}
            className="nn-focus-ring h-9 rounded-lg border border-green-100 px-3 text-xs font-bold uppercase tracking-[1px] text-slate-600 transition-colors hover:bg-green-50 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setQuery({ page: page + 1 })}
            className="nn-focus-ring h-9 rounded-lg border border-green-100 px-3 text-xs font-bold uppercase tracking-[1px] text-slate-600 transition-colors hover:bg-green-50 disabled:opacity-40"
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
          <Button variant="secondary" onClick={() => setTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
