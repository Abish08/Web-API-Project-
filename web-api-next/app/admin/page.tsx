import Link from "next/link";
import { redirect } from "next/navigation";
import { getTokenCookie } from "@/lib/cookies";
import { apiUrl } from "@/lib/api/server";
import { AdminStats, ApiResponse } from "@/lib/api/types";

async function getAdminStats(token: string): Promise<AdminStats | null> {
  const response = await fetch(apiUrl("/api/v1/admin/stats"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  const body = (await response.json()) as ApiResponse<AdminStats>;
  return body.success ? body.data : null;
}

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const token = await getTokenCookie();
  if (!token) redirect("/login");

  const stats = await getAdminStats(token);

  if (!stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Unable to load admin statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Welcome back. Here&apos;s what&apos;s happening with NutriNepal today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} detail={`${stats.activeUsers} active users`} />
        <StatCard label="Total Foods" value={stats.totalFoods} detail="Approved food records" />
        <StatCard label="Total Workouts" value={stats.totalWorkouts} detail="Workout records" />
        <StatCard label="Logs" value={stats.totalFoodLogs + stats.totalWorkoutLogs} detail="Food and workout logs" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link href="/admin/users" className="text-sm font-medium text-green-600 hover:text-green-700">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentRegistrations.length ? stats.recentRegistrations.map((user) => (
              <div key={user._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{user.role}</span>
              </div>
            )) : (
              <p className="px-6 py-8 text-center text-sm text-gray-500">No users found.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Last Seven Days</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Food Logs" value={stats.logsLastSevenDays.food} detail="Last 7 days" />
            <StatCard label="Workout Logs" value={stats.logsLastSevenDays.workout} detail="Last 7 days" />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Goal Distribution</h2>
          <div className="space-y-3">
            {stats.usersByGoal.map((item) => (
              <div key={item._id || "unknown"} className="flex justify-between text-sm">
                <span className="capitalize text-gray-600">{item._id || "unknown"}</span>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Popular Foods</h2>
          <div className="space-y-3">
            {stats.mostLoggedFoods.length ? stats.mostLoggedFoods.map((food) => (
              <div key={food.foodId} className="flex justify-between text-sm">
                <span className="text-gray-600">{food.name}</span>
                <span className="font-semibold text-gray-900">{food.count}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No food log data yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
