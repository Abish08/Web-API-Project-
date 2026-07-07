import { getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminOverviewPage() {
  let stats = {
    totalUsers: 0,
    totalFoods: 0,
    totalWorkouts: 0,
    activeUsersToday: 0,
  };

  let recentUsers: any[] = [];

  try {
    const token = await getTokenCookie();
    
    if (!token) {
      redirect("/login");
    }

    // Fetch users
    try {
      const usersResponse = await fetch("http://localhost:8089/api/v1/admin/users", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log("Users API Response:", JSON.stringify(usersData, null, 2));
        
        if (usersData.success) {
          if (Array.isArray(usersData.data)) {
            recentUsers = usersData.data.slice(0, 5);
            stats.totalUsers = usersData.total || usersData.data.length;
          } else if (usersData.data?.users) {
            recentUsers = usersData.data.users.slice(0, 5);
            stats.totalUsers = usersData.data.total || usersData.data.users.length;
          } else if (usersData.users) {
            recentUsers = usersData.users.slice(0, 5);
            stats.totalUsers = usersData.total || usersData.users.length;
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }

    // Fetch foods count
    try {
      const foodsResponse = await fetch("http://localhost:8089/api/v1/foods?limit=1", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      if (foodsResponse.ok) {
        const foodsData = await foodsResponse.json();
        console.log("Foods API Response:", JSON.stringify(foodsData, null, 2));
        
        if (foodsData.success) {
          stats.totalFoods = foodsData.pagination?.total || foodsData.total || foodsData.data?.length || 0;
        }
      }
    } catch (error) {
      console.error("Failed to fetch foods:", error);
    }

  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening with NutriNepal today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="mt-1 text-xs text-green-600">+12% from last month</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Foods */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Foods</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalFoods}</p>
              <p className="mt-1 text-xs text-gray-500">In database</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Workouts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workouts</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalWorkouts}</p>
              <p className="mt-1 text-xs text-gray-500">Exercise plans</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Users Today */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users Today</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeUsersToday}</p>
              <p className="mt-1 text-xs text-green-600">+5% from yesterday</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Recent Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Link href="/admin/users" className="text-sm font-medium text-green-600 hover:text-green-700">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentUsers.length > 0 ? (
              recentUsers.map((user: any) => (
                <div key={user._id || user.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <span className="text-sm font-semibold text-green-700">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* System Performance */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">System Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Health</span>
                <span className="text-sm font-medium text-green-600">Excellent</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "98%" }}></div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-green-600">Fast</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-500" style={{ width: "95%" }}></div>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Usage</span>
                <span className="text-sm font-medium text-yellow-600">65%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-yellow-500" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/users"
            className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <svg className="mb-2 h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Add User</span>
          </Link>
          <Link
            href="/admin/foods"
            className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <svg className="mb-2 h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Add Food</span>
          </Link>
        </div>
      </div>
    </div>
  );
}