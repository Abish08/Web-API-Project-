import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetUserById } from "@/lib/actions/admin/user-action";
import UserFormEdit from "../../_components/UserFormEdit";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await handleGetUserById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-[700px]">
      <Link 
        href="/admin/users" 
        className="text-xs uppercase tracking-[1.5px] text-gray-500 hover:text-gray-900"
      >
        ← Back to users
      </Link>
      <h2 className="mb-8 mt-4 text-3xl font-bold text-gray-900">Edit user</h2>
      <UserFormEdit user={result.data} />
    </section>
  );
}