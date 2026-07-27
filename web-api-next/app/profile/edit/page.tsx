import { getUserData, getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import HealthProfileForm from "@/components/HealthProfileForm";
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
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-gray-800">NutriNepal</span>
            </div>

            <nav className="hidden md:flex space-x-6">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Home</a>
              <a href="/meals" className="text-gray-600 hover:text-gray-900 text-sm">Meals</a>
              <a href="/workout" className="text-gray-600 hover:text-gray-900 text-sm">Workout</a>
              <a href="/log" className="text-gray-600 hover:text-gray-900 text-sm">Log</a>
              <a href="/progress" className="text-gray-600 hover:text-gray-900 text-sm">Progress</a>
              <a href="/profile" className="text-gray-900 font-medium text-sm border-b-2 border-green-500 pb-1">Profile</a>
            </nav>

            <div className="flex space-x-3">
              <a href="/register" className="px-4 py-2 text-sm font-medium text-gray-700">Register</a>
              <a href="/login" className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">Login</a>
            </div>
          </div>
        </div>
      </header>

      {/* Dark Green Header */}
      <div className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            {initialData ? "Edit Health Profile" : "Create Health Profile"}
          </h1>
          <p className="text-green-100 text-lg">
            {initialData
              ? "Update your health information to get personalized recommendations."
              : "Enter your health information to get started with personalized recommendations."}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="bg-white rounded-lg shadow p-8">
          <HealthProfileForm
            onSubmit={saveHealthProfile}
            initialData={initialData}
          />
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <a
            href="/profile"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </a>
        </div>
      </div>
    </div>
  );
}
