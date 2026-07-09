"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTodayFoodSummaryAction, getTodayWorkoutSummaryAction } from "./actions";
import { getUserData } from "@/lib/cookies";
import { getUserHealthProfileAction } from "@/app/meals/actions";

export default function DashboardPage() {
  const [foodSummary, setFoodSummary] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [workoutSummary, setWorkoutSummary] = useState({ duration: 0, calories: 0 });
  const [recentFoodLogs, setRecentFoodLogs] = useState<any[]>([]);
  const [recentWorkoutLogs, setRecentWorkoutLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [healthProfile, setHealthProfile] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userData = await getUserData();
      if (userData) {
        setUserName(userData.firstName || "there");
      }

      try {
        const profileResult = await getUserHealthProfileAction();
        if (profileResult.success) {
          setHealthProfile(profileResult.data);
        }
      } catch (e) {
        console.log("Health profile not available");
      }

      const [foodResult, workoutResult] = await Promise.all([
        getTodayFoodSummaryAction(),
        getTodayWorkoutSummaryAction(),
      ]);

      if (foodResult.success) {
        setFoodSummary(foodResult.summary || { calories: 0, protein: 0, carbs: 0, fats: 0 });
        setRecentFoodLogs(foodResult.data || []);
      }

      if (workoutResult.success) {
        setWorkoutSummary(workoutResult.summary || { duration: 0, calories: 0 });
        setRecentWorkoutLogs(workoutResult.data || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // --- REAL DATA CALCULATIONS ---
  const targetCalories = healthProfile?.targetCalories || 2000;
  const proteinTarget = healthProfile?.macros?.protein || 150;
  const carbsTarget = healthProfile?.macros?.carbs || 250;
  const fatsTarget = healthProfile?.macros?.fats || 70;
  
  const netCalories = foodSummary.calories - workoutSummary.calories;
  const remainingCalories = targetCalories - netCalories;
  const isOverBudget = remainingCalories < 0;

  // Calorie progress percentage
  const calorieProgress = Math.min((netCalories / targetCalories) * 100, 100);

  // --- ICONS (Replaced shopping cart with proper food icons) ---
  const FoodIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const FlameIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  );

  const ChartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const ClockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  // --- MACRO BAR COMPONENT ---
  const MacroBar = ({ label, current, target, color }: { label: string; current: number; target: number; color: string }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">{Math.round(current)}g / {target}g</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${color}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-gray-900">NutriNepal</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Home</Link>
              <Link href="/meals" className="text-gray-600 hover:text-green-600 text-sm font-medium">Meals</Link>
              <Link href="/workout" className="text-gray-600 hover:text-green-600 text-sm font-medium">Workout</Link>
              <Link href="/log" className="text-gray-600 hover:text-green-600 text-sm font-medium">Log</Link>
              <Link href="/progress" className="text-gray-600 hover:text-green-600 text-sm font-medium">Progress</Link>
              <Link href="/profile" className="text-gray-600 hover:text-green-600 text-sm font-medium">Profile</Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-500">Here's your activity summary for today</p>
        </div>

        {/* Summary Cards - All with "Today" badge for consistency */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Calories Consumed - WITH progress bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <FoodIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Calories Consumed</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(foodSummary.calories)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(foodSummary.calories)} / {targetCalories} kcal
            </p>
            {/* Mini progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-green-500 transition-all duration-500" 
                style={{ width: `${calorieProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Calories Burned */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <FlameIcon className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Burned</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Calories Burned</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(workoutSummary.calories)}</p>
            <p className="text-xs text-gray-400 mt-1">kcal today</p>
          </div>

          {/* Net Calories - FIXED: Consistent badge, label, and color */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <ChartIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isOverBudget 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-blue-600 bg-blue-50'
              }`}>
                {isOverBudget ? 'Over Budget' : 'Remaining'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Net Calories</p>
            <p className={`text-3xl font-bold ${
              isOverBudget ? 'text-red-600' : 'text-blue-600'
            }`}>
              {Math.abs(Math.round(remainingCalories))}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isOverBudget ? 'kcal over target' : 'kcal remaining'}
            </p>
          </div>

          {/* Workout Time */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Workout Time</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(workoutSummary.duration)}</p>
            <p className="text-xs text-gray-400 mt-1">minutes today</p>
          </div>
        </div>

        {/* Macros & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Macronutrients */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Today's Macros</h2>
            <div className="space-y-5">
              <MacroBar label="Protein" current={foodSummary.protein} target={proteinTarget} color="bg-blue-500" />
              <MacroBar label="Carbs" current={foodSummary.carbs} target={carbsTarget} color="bg-green-500" />
              <MacroBar label="Fats" current={foodSummary.fats} target={fatsTarget} color="bg-yellow-500" />
            </div>
          </div>

          {/* Recent Food Logs - Limited to 3 for consistency */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Food</h2>
              <Link href="/log" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
            </div>
            {recentFoodLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FoodIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No food logged today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFoodLogs.slice(0, 3).map((log) => (
                  <div key={log._id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                        <FoodIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{log.foodId?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-400">{log.mealType} • {log.servings} serving(s)</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{Math.round(log.totalCalories)} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Workout Logs - Limited to 3 for consistency */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Workouts</h2>
              <Link href="/workout" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
            </div>
            {recentWorkoutLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FlameIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No workouts logged today</p>
                <Link href="/workout" className="text-sm text-green-600 hover:underline mt-2 inline-block">
                  Log your first workout →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWorkoutLogs.slice(0, 3).map((log) => (
                  <div key={log._id} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                        <FlameIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{log.workoutId?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-400">{log.duration} mins</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{Math.round(log.caloriesBurned)} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/log"
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-xl font-bold text-white mb-1">Log Food</p>
              <p className="text-sm text-green-100">Track what you ate today</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          </Link>

          <Link
            href="/workout"
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-white mb-1">Log Workout</p>
              <p className="text-sm text-purple-100">Track your exercise</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          </Link>

          <Link
            href="/progress"
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChartIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-xl font-bold text-white mb-1">View Progress</p>
              <p className="text-sm text-blue-100">Track your goals</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          </Link>
        </div>
      </div>
    </div>
  );
}