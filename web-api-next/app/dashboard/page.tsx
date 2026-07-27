"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getTodayFoodSummaryAction, getTodayWorkoutSummaryAction } from "./actions";
import { getUserData } from "@/lib/cookies";
import { getUserHealthProfileAction } from "@/app/meals/actions";
import { FoodLog, HealthProfile, WorkoutLog } from "@/lib/api/types";

type FoodSummary = { calories: number; protein: number; carbs: number; fats: number };
type WorkoutSummary = { duration: number; calories: number };

const defaultFoodSummary: FoodSummary = { calories: 0, protein: 0, carbs: 0, fats: 0 };
const defaultWorkoutSummary: WorkoutSummary = { duration: 0, calories: 0 };

function Icon({ type, className = "w-6 h-6" }: { type: "food" | "flame" | "chart" | "clock"; className?: string }) {
  const paths = {
    food: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    flame: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[type]} />
    </svg>
  );
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{Math.round(current)}g / {target}g</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [foodSummary, setFoodSummary] = useState<FoodSummary>(defaultFoodSummary);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(defaultWorkoutSummary);
  const [recentFoodLogs, setRecentFoodLogs] = useState<FoodLog[]>([]);
  const [recentWorkoutLogs, setRecentWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const userData = await getUserData();
      setUserName(userData?.firstName || "there");

      const [profileResult, foodResult, workoutResult] = await Promise.allSettled([
        getUserHealthProfileAction(),
        getTodayFoodSummaryAction(),
        getTodayWorkoutSummaryAction(),
      ]);

      if (profileResult.status === "fulfilled" && profileResult.value.success) {
        setHealthProfile(profileResult.value.data as HealthProfile);
      }

      if (foodResult.status === "fulfilled" && foodResult.value.success) {
        setFoodSummary((foodResult.value.summary as FoodSummary | undefined) || defaultFoodSummary);
        setRecentFoodLogs((foodResult.value.data as FoodLog[] | undefined) || []);
      }

      if (workoutResult.status === "fulfilled" && workoutResult.value.success) {
        setWorkoutSummary((workoutResult.value.summary as WorkoutSummary | undefined) || defaultWorkoutSummary);
        setRecentWorkoutLogs((workoutResult.value.data as WorkoutLog[] | undefined) || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-600" />
      </div>
    );
  }

  const targetCalories = healthProfile?.targetCalories || 2000;
  const proteinTarget = healthProfile?.macros?.protein || 150;
  const carbsTarget = healthProfile?.macros?.carbs || 250;
  const fatsTarget = healthProfile?.macros?.fats || 70;
  const netCalories = foodSummary.calories - workoutSummary.calories;
  const remainingCalories = targetCalories - netCalories;
  const calorieProgress = Math.min((netCalories / targetCalories) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="font-bold text-gray-900">NutriNepal</span>
          </Link>
          <div className="hidden items-center space-x-8 md:flex">
            {["meals", "workout", "log", "progress", "profile"].map((item) => (
              <Link key={item} href={`/${item}`} className="text-sm font-medium capitalize text-gray-600 hover:text-green-600">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold text-gray-900">{greeting()}, {userName}</h1>
          <p className="text-gray-500">Here&apos;s your activity summary for today.</p>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Icon type="food" className="mb-4 h-6 w-6 text-green-600" />
            <p className="text-sm font-medium text-gray-500">Calories Consumed</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(foodSummary.calories)}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${calorieProgress}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Icon type="flame" className="mb-4 h-6 w-6 text-orange-600" />
            <p className="text-sm font-medium text-gray-500">Calories Burned</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(workoutSummary.calories)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Icon type="chart" className="mb-4 h-6 w-6 text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Calories Remaining</p>
            <p className={`text-3xl font-bold ${remainingCalories < 0 ? "text-red-600" : "text-blue-600"}`}>
              {Math.abs(Math.round(remainingCalories))}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <Icon type="clock" className="mb-4 h-6 w-6 text-purple-600" />
            <p className="text-sm font-medium text-gray-500">Workout Time</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(workoutSummary.duration)} min</p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Today&apos;s Macros</h2>
            <div className="space-y-5">
              <MacroBar label="Protein" current={foodSummary.protein} target={proteinTarget} color="bg-blue-500" />
              <MacroBar label="Carbs" current={foodSummary.carbs} target={carbsTarget} color="bg-green-500" />
              <MacroBar label="Fats" current={foodSummary.fats} target={fatsTarget} color="bg-yellow-500" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Food</h2>
              <Link href="/log" className="text-sm font-medium text-green-600">View all</Link>
            </div>
            {recentFoodLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No food logged today.</p>
            ) : recentFoodLogs.slice(0, 3).map((log) => (
              <div key={log._id} className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{typeof log.foodId === "object" ? log.foodId.name : "Food"}</p>
                  <p className="text-xs text-gray-400">{log.mealType} - {log.servings} serving(s)</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{Math.round(log.totalCalories)} kcal</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Workouts</h2>
              <Link href="/workout" className="text-sm font-medium text-green-600">View all</Link>
            </div>
            {recentWorkoutLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No workouts logged today.</p>
            ) : recentWorkoutLogs.slice(0, 3).map((log) => (
              <div key={log._id} className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{typeof log.workoutId === "object" ? log.workoutId.name : "Workout"}</p>
                  <p className="text-xs text-gray-400">{log.duration} minutes</p>
                </div>
                <span className="text-sm font-bold text-orange-600">{Math.round(log.caloriesBurned)} kcal</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Link href="/log" className="rounded-2xl bg-green-600 p-6 text-white shadow-sm hover:bg-green-700">
            <p className="text-xl font-bold">Log Food</p>
            <p className="text-sm text-green-50">Track what you ate today</p>
          </Link>
          <Link href="/workout" className="rounded-2xl bg-emerald-700 p-6 text-white shadow-sm hover:bg-emerald-800">
            <p className="text-xl font-bold">Log Workout</p>
            <p className="text-sm text-emerald-50">Track your exercise</p>
          </Link>
          <Link href="/progress" className="rounded-2xl bg-slate-700 p-6 text-white shadow-sm hover:bg-slate-800">
            <p className="text-xl font-bold">View Progress</p>
            <p className="text-sm text-slate-100">Review your trends</p>
          </Link>
          <Link href="/weekly-plan" className="rounded-2xl bg-green-700 p-6 text-white shadow-sm hover:bg-green-800 md:col-span-3">
            <p className="text-xl font-bold">Weekly Plan</p>
            <p className="text-sm text-green-50">Review generated meals and workouts for the week</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
