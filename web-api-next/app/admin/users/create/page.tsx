import Link from "next/link";
import UserForm from "../_components/UserForm";

export default function CreateUserPage() {
  return (
    <section className="mx-auto w-full max-w-[700px]">
      <Link 
        href="/admin/users" 
        className="text-xs uppercase tracking-[1.5px] text-gray-500 hover:text-gray-900"
      >
        ← Back to users
      </Link>
      <h2 className="mb-8 mt-4 text-3xl font-bold text-gray-900">New user</h2>
      <UserForm />
    </section>
  );
}