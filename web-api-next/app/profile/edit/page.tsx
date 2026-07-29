import { getUserData, getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import HealthProfileForm from "@/components/HealthProfileForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { apiUrl } from "@/lib/api/server";

type HealthProfileFormData = {
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
};

export default async function EditProfilePage() {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  // Fetch existing health profile to pre-fill the form
  let initialData: HealthProfileFormData | null = null;
  try {
    const token = await getTokenCookie();
    const response = await fetch(apiUrl("/api/v1/health-profile"), {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    const data = await response.json();
    if (data.success && data.data) {
      initialData = {
        weight: data.data.weight,
        height: data.data.height,
        age: data.data.age,
        gender: data.data.gender,
        activityLevel: data.data.activityLevel,
        goal: data.data.goal,
      };
    }
  } catch {
    initialData = null;
  }

  const saveHealthProfile = async (data: HealthProfileFormData) => {
    "use server";

    const token = await getTokenCookie();

    const response = await fetch(apiUrl("/api/v1/health-profile"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // Force cache refresh after successful save
    if (result.success) {
      revalidatePath("/profile");
      revalidatePath("/profile/edit");
      revalidatePath("/dashboard");
    }

    return result;
  };

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Health profile"
        title={initialData ? "Edit Health Profile" : "Create Health Profile"}
        description={
          initialData
            ? "Update your body metrics and goal to keep recommendations accurate."
            : "Build your blueprint so NutriNepal can personalize meals and workouts."
        }
        action={
          <Link href="/profile" className="nn-focus-ring rounded-full px-3 py-2 text-sm font-bold text-green-900 hover:bg-green-100">
            Back to Profile
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 md:p-8">
          <HealthProfileForm
            onSubmit={saveHealthProfile}
            initialData={initialData}
          />
        </Card>

        <aside className="space-y-5">
          <Card className="bg-green-950 p-6 text-white">
            <h2 className="text-xl font-black">Why this matters</h2>
            <p className="mt-2 text-sm leading-6 text-green-50">
              These fields feed your calorie target, macro targets, diet recommendations, workout plan, and weekly roadmap.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-black text-slate-950">Saved fields</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Weight, height, age, gender, activity level, and goal are submitted in the existing backend payload shape.
            </p>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
