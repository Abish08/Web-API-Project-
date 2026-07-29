import Link from "next/link";
import UserForm from "../_components/UserForm";

export default function CreateUserPage() {
  return (
    <section className="mx-auto w-full max-w-[700px]">
      <Link 
        href="/admin/users" 
        className="text-xs uppercase tracking-[1.5px] text-slate-500 hover:text-slate-950"
      >
        &larr; Back to users
      </Link>
      <h2 className="mb-8 mt-4 text-3xl font-bold text-slate-950">New user</h2>
      <UserForm />
    </section>
  );
}