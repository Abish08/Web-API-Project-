import { handleWhoami } from "@/lib/actions/auth-action";
import UpdateProfileForm from "./_components/UpdateProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const res = await handleWhoami();

  if (!res.success || !res.data) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <UpdateProfileForm user={res.data} />
      </div>
    </div>
  );
}