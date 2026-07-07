"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTodayFoodSummaryAction, getTodayWorkoutSummaryAction } from "./actions";

export default function DashboardPage() {
  const [foodSummary, setFoodSummary] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [workoutSummary, setWorkoutSummary] = useState({ duration: 0, calories: 0 });
  const [recentFoodLogs, setRecentFoodLogs] = useState<any[]>([]);
  const [recentWorkoutLogs, setRecentWorkoutLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [foodResult, workoutResult] = await Promise.all([
        getTodayFoodSummaryAction(),
        getTodayWorkoutSummaryAction(),
      ]);

      if (foodResult.success) {
        setFoodSummary(foodResult.summary);
        setRecentFoodLogs(foodResult.data || []);
      }

      if (workoutResult.success) {
        setWorkoutSummary(workoutResult.summary);
        setRecentWorkoutLogs(workoutResult.data || []);
      }

      // Get user name from cookie or API
      const userData = await getUserData();
      if (userData) {
        setUserName(userData.firstName || "User");
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Failed to get user data:", error);
    }
    return null;
  };

  const totalCaloriesBurned = workoutSummary.calories;
  const totalCaloriesConsumed = foodSummary.calories;
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
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
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-green-600">Login</Link>
              <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600">Here's your activity for today</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calories Consumed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{Math.round(foodSummary.calories)}</p>
                <p className="text-xs text-gray-500 mt-1">kcal today</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{Math.round(workoutSummary.calories)}</p>
                <p className="text-xs text-gray-500 mt-1">kcal today</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Calories</p>
                <p className={`text-3xl font-bold mt-2 ${netCalories > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {Math.round(netCalories)}
                </p>
                <p className="text-xs text-gray-500 mt-1">remaining</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workout Time</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{Math.round(workoutSummary.duration)}</p>
                <p className="text-xs text-gray-500 mt-1">minutes today</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Macronutrients */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Macros</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Protein</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(foodSummary.protein)}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((foodSummary.protein / 150) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Carbs</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(foodSummary.carbs)}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((foodSummary.carbs / 250) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Fats</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(foodSummary.fats)}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min((foodSummary.fats / 70) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Food Logs */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Food</h2>
              <Link href="/log" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
            </div>
            {recentFoodLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No food logged today</p>
            ) : (
              <div className="space-y-3">
                {recentFoodLogs.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{log.foodId?.name}</p>
                      <p className="text-xs text-gray-500">{log.servings} serving(s) • {log.mealType}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{Math.round(log.totalCalories)} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Workout Logs */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Workouts</h2>
              <Link href="/workout" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
            </div>
            {recentWorkoutLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No workouts logged today</p>
            ) : (
              <div className="space-y-3">
                {recentWorkoutLogs.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{log.workoutId?.name}</p>
                      <p className="text-xs text-gray-500">{log.duration} mins</p>
                    </div>
                    <span className="text-sm font-semibold text-orange-600">{Math.round(log.caloriesBurned)} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/log"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="font-semibold">Log Food</p>
            <p className="text-sm text-green-100">Track what you ate</p>
          </Link>

          <Link
            href="/workout"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="font-semibold">Log Workout</p>
            <p className="text-sm text-purple-100">Track your exercise</p>
          </Link>

          <Link
            href="/progress"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="font-semibold">View Progress</p>
            <p className="text-sm text-blue-100">Track your goals</p>
          </Link>
        </div>
      </div>
    </div>
  );
}