import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { handleGetUserById } from "@/lib/actions/admin/user-action";

export default async function ViewUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await handleGetUserById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  return (
    <section className="mx-auto w-full max-w-[700px]">
      <Link 
        href="/admin/users" 
        className="text-xs uppercase tracking-[1.5px] text-gray-500 hover:text-gray-900"
      >
        ← Back to users
      </Link>

      <div className="mt-4 mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 font-bold">
          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <Link
          href={`/admin/users/${user._id}/edit`}
          className="ml-auto flex h-10 items-center border border-gray-300 px-4 text-xs font-bold uppercase tracking-[1.5px] text-gray-700 transition-colors hover:text-gray-900 rounded-md"
        >
          Edit
        </Link>
      </div>

      <dl className="divide-y divide-gray-200 border border-gray-200 rounded-md bg-white">
        {[
          ["First Name", user.firstName],
          ["Last Name", user.lastName],
          ["Email", user.email],
          ["Username", user.username],
          ["Role", user.role],
          ["Created", user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3">
            <dt className="text-xs uppercase tracking-[1px] text-gray-500">{label}</dt>
            <dd className="text-sm font-medium text-gray-900">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}