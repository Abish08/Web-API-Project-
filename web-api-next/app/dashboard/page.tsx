import { getUserData } from "@/lib/cookies";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const userData = await getUserData();
  
  if (!userData) {
    redirect("/login");
  }

  const firstName = userData.firstName || userData.username || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">NutriNepal</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-900 font-medium text-sm">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Meals</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Workout</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Log</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Progress</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Profile</a>
            </nav>

            <div className="flex space-x-3">
              <a href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Login
              </a>
              <a href="/register" className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Register
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Good Morning, {firstName}.
          </h1>
          <p className="text-gray-600">
            Your metabolic data indicates peak performance potential today. Let's maintain your nutritional precision.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* BMI Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Body Mass Index</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-gray-800">22.4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>

          {/* Calorie Target */}
          <div className="bg-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <span className="text-sm font-medium">DAILY CALORIE TARGET</span>
            </div>
            <div className="text-4xl font-bold mb-2">2,450</div>
            <p className="text-sm text-green-100">1,320 kcal remaining for today</p>
          </div>

          {/* Macronutrients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Macronutrients</h3>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-sm font-bold text-gray-800">45%</span>
                </div>
                <p className="text-sm text-gray-600">Protein</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-sm font-bold text-gray-800">30%</span>
                </div>
                <p className="text-sm text-gray-600">Carbs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-sm font-bold text-gray-800">25%</span>
                </div>
                <p className="text-sm text-gray-600">Fats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Biometric Sync */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Biometric Sync Active</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">LIVE</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Your wearable device is currently providing real-time glucose and heart rate variance data.
            </p>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm">Chart Placeholder</span>
              </div>
            </div>
          </div>

          {/* Meal Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Meal Plan</h3>
              <a href="#" className="text-orange-600 text-sm font-medium hover:text-orange-700">View Menu →</a>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">B</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Breakfast</h4>
                  <p className="text-sm text-gray-600">Avocado Toast & Eggs</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Done</span>
              </div>

              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">L</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Lunch</h4>
                  <p className="text-sm text-gray-600">Grilled Chicken & Quinoa</p>
                </div>
                <span className="text-xs text-gray-500 font-medium">Upcoming</span>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">D</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Dinner</h4>
                  <p className="text-sm text-gray-600">Salmon & Asparagus</p>
                </div>
                <span className="text-xs text-gray-400 font-medium">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Workout */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Today's Workout</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">45 Min</span>
            </div>
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Workout Video Placeholder</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Metabolic Conditioning</h4>
            <p className="text-sm text-gray-600">Focus: Stability and VO2 Max elevation</p>
          </div>

          {/* Daily Agenda */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Agenda</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Hydration & Mobility Routine</p>
                  <p className="text-xs text-gray-500">7:00 AM</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">COMPLETED</span>
              </div>

              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Power Lunch & Metabolism Check</p>
                  <p className="text-xs text-gray-500">12:00 PM</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">1200 KCAL</span>
              </div>

              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Evening Workout Session</p>
                  <p className="text-xs text-gray-500">5:00 PM</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">UPCOMING</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">NutriNepal</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Privacy Protocol</a>
              <a href="#" className="hover:text-gray-900">Data Security</a>
              <a href="#" className="hover:text-gray-900">Methodology</a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            © 2024 NutriNepal Health Systems. All biological data encrypted.
          </p>
        </div>
      </footer>
    </div>
  );
}