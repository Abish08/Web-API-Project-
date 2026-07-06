import { getUserData, getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  // Fetch health profile from backend
  let healthProfile = null;
  try {
    const token = await getTokenCookie();
    const response = await fetch("http://localhost:8089/api/v1/health-profile", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    const data = await response.json();
    if (data.success) {
      healthProfile = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch health profile:", error);
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-500" };
    if (bmi < 25) return { label: "Normal Range", color: "bg-green-500" };
    if (bmi < 30) return { label: "Overweight", color: "bg-yellow-500" };
    return { label: "Obese", color: "bg-red-500" };
  };

  const bmiCategory = healthProfile ? getBMICategory(healthProfile.bmi) : null;

  // Get user initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Home</Link>
              <Link href="/meals" className="text-gray-600 hover:text-gray-900 text-sm">Meals</Link>
              <Link href="/workout" className="text-gray-600 hover:text-gray-900 text-sm">Workout</Link>
              <Link href="/log" className="text-gray-600 hover:text-gray-900 text-sm">Log</Link>
              <Link href="/progress" className="text-gray-600 hover:text-gray-900 text-sm">Progress</Link>
              <Link href="/profile" className="text-gray-900 font-medium text-sm border-b-2 border-green-500 pb-1">Profile</Link>
            </nav>

            <div className="flex space-x-3">
              <a href="/register" className="px-4 py-2 text-sm font-medium text-gray-700">Register</a>
              <a href="/login" className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">Login</a>
            </div>
          </div>
        </div>
      </header>

      {/* Dark Green Header Section */}
      <div className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">User Profile</h1>
          <p className="text-green-100 text-lg">
            Manage your clinical health data and account preferences within a secure, professional environment.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info & Health Profile */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Account Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
                <div className="flex gap-3">
                  <Link
                    href="/password"  // ✅ Link to your existing ChangePasswordForm
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </Link>
                  <Link
                    href="/profile/edit-account"  // You can create this or use your existing UpdateProfileForm
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Info
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6">
                {/* Profile Picture */}
                <div className="relative">
                  {userData.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center border-4 border-green-600">
                      <span className="text-white text-3xl font-bold">
                        {getInitials(userData.firstName, userData.lastName)}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <p className="text-gray-600 mb-2">@{userData.username}</p>
                  <p className="text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {userData.email}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Member since {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2024'}
                  </p>
                </div>
              </div>
            </div>

            {/* Health Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Health Profile</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Last assessment: {healthProfile ? new Date(healthProfile.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No data'}
                  </p>
                </div>
                <Link
                  href="/profile/edit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Health Profile
                </Link>
              </div>

              {/* Stats Grid */}
              {healthProfile ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Current Weight</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {healthProfile.weight} <span className="text-sm font-normal text-gray-600">kg</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Height</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {healthProfile.height} <span className="text-sm font-normal text-gray-600">cm</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Age</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {healthProfile.age} <span className="text-sm font-normal text-gray-600">yrs</span>
                      </p>
                    </div>
                  </div>

                  {/* BMI Section */}
                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-green-500">
                          <span className="text-xl font-bold text-gray-800">{healthProfile.bmi}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">BMI Index</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${bmiCategory?.color}`}>
                            {bmiCategory?.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 ml-8">
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="absolute inset-0 flex">
                            <div className="w-1/4 bg-blue-400"></div>
                            <div className="w-1/4 bg-green-500"></div>
                            <div className="w-1/4 bg-yellow-400"></div>
                            <div className="w-1/4 bg-red-500"></div>
                          </div>
                          <div
                            className="absolute top-0 w-3 h-3 bg-gray-800 rounded-full -mt-0.5 transform -translate-x-1/2"
                            style={{ left: `${Math.min((healthProfile.bmi / 40) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Underweight</span>
                          <span>Healthy</span>
                          <span>Overweight</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Goals and Conditions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Primary Goal</p>
                      <p className="text-sm font-medium text-gray-800">
                        {healthProfile.goal === 'lose' && 'Weight Loss'}
                        {healthProfile.goal === 'maintain' && 'Maintain Weight'}
                        {healthProfile.goal === 'gain' && 'Muscle Gain'}
                      </p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Activity Level</p>
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {healthProfile.activityLevel.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Daily Calorie & Macros */}
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="bg-green-600 text-white rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold mb-1">Daily Calories</p>
                      <p className="text-2xl font-bold">{healthProfile.targetCalories}</p>
                      <p className="text-xs text-green-100">kcal/day</p>
                    </div>
                    <div className="bg-white border-2 border-green-500 rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-gray-800">{healthProfile.macros.protein}g</p>
                      <p className="text-xs text-gray-500">30%</p>
                    </div>
                    <div className="bg-white border-2 border-orange-500 rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-gray-800">{healthProfile.macros.carbs}g</p>
                      <p className="text-xs text-gray-500">40%</p>
                    </div>
                    <div className="bg-white border-2 border-blue-500 rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Fats</p>
                      <p className="text-2xl font-bold text-gray-800">{healthProfile.macros.fats}g</p>
                      <p className="text-xs text-gray-500">30%</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No health profile data found.</p>
                  <Link
                    href="/profile/edit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Create Health Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Weight Fluctuations Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight Fluctuations (Last 30 Days)</h3>
              <div className="h-48 bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-400 text-sm">Chart will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Right Column - Account Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Privacy & Security</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">English (US)</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Activity Logs</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <form action={async () => {
                  "use server";
                  const { handleLogout } = await import("@/lib/actions/auth-action");
                  await handleLogout();
                }}>
                  <button
                    type="submit"
                    className="w-full text-red-600 hover:text-red-700 font-medium text-sm flex items-center justify-center gap-2 py-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </form>
              </div>
            </div>

            {/* Clinical Support Card */}
            <div className="bg-green-900 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Clinical Support</h3>
              <p className="text-sm text-green-100 mb-4">
                Access priority consultations with certified clinical nutritionists 24/7.
              </p>
              <button className="w-full bg-white text-green-900 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg text-sm transition-colors">
                Connect with Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}