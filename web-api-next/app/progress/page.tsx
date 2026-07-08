"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTokenCookie } from "@/lib/cookies";
import {
  getCalorieHistoryAction,
  getWorkoutHistoryAction,
  getSummaryAction,
} from "./actions";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState(30);
  const [calorieData, setCalorieData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalFoodLogs: 0, totalWorkoutLogs: 0 });
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    workoutDuration: 0,
    caloriesBurned: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadTodayStats();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [calorieResult, workoutResult, summaryResult] = await Promise.all([
        getCalorieHistoryAction(timeRange),
        getWorkoutHistoryAction(timeRange),
        getSummaryAction(),
      ]);

      if (calorieResult.success) setCalorieData(calorieResult.data);
      if (workoutResult.success) setWorkoutData(workoutResult.data);
      if (summaryResult.success) setSummary(summaryResult.data);
    } catch (error) {
      console.error("Failed to load progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch today's food logs
      const foodRes = await fetch(`http://localhost:8089/api/v1/food-logs?date=${today}`, {
        headers: { "Authorization": `Bearer ${await getTokenCookie()}` },
      });
      const foodData = await foodRes.json();
      
      // Fetch today's workout logs
      const workoutRes = await fetch(`http://localhost:8089/api/v1/workout-logs?date=${today}`, {
        headers: { "Authorization": `Bearer ${await getTokenCookie()}` },
      });
      const workoutData = await workoutRes.json();
      
      if (foodData.success && workoutData.success) {
        setTodayStats({
          calories: foodData.summary?.calories || 0,
          protein: foodData.summary?.protein || 0,
          carbs: foodData.summary?.carbs || 0,
          fats: foodData.summary?.fats || 0,
          workoutDuration: workoutData.summary?.duration || 0,
          caloriesBurned: workoutData.summary?.calories || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load today's stats:", error);
    }
  };

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
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 text-sm font-medium">Home</Link>
              <Link href="/meals" className="text-gray-600 hover:text-green-600 text-sm font-medium">Meals</Link>
              <Link href="/workout" className="text-gray-600 hover:text-green-600 text-sm font-medium">Workout</Link>
              <Link href="/log" className="text-gray-600 hover:text-green-600 text-sm font-medium">Log</Link>
              <Link href="/progress" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Progress</Link>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your fitness journey over time</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === days
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>

        {/* Today's Progress */}
               {/* Today's Progress */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Today's Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/90 mb-1">Calories</p>
              <p className="text-3xl font-bold text-white">{todayStats.calories}</p>
              <p className="text-xs text-white/75">kcal consumed</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/90 mb-1">Protein</p>
              <p className="text-3xl font-bold text-white">{todayStats.protein}g</p>
              <p className="text-xs text-white/75">protein</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/90 mb-1">Workout</p>
              <p className="text-3xl font-bold text-white">{todayStats.workoutDuration}m</p>
              <p className="text-xs text-white/75">{todayStats.caloriesBurned} kcal</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/90 mb-1">Net Calories</p>
              <p className="text-3xl font-bold text-white">
                {todayStats.calories - todayStats.caloriesBurned}
              </p>
              <p className="text-xs text-white/75">remaining</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Food Logs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{summary.totalFoodLogs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{summary.totalWorkoutLogs}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Days</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {new Set([...calorieData.map((d: any) => d._id), ...workoutData.map((d: any) => d._id)]).size}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading charts...</div>
        ) : (
          <div className="space-y-8">
            {/* Calorie Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Calorie Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="_id" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#16A34A"
                    fill="#16A34A"
                    fillOpacity={0.1}
                    name="Calories"
                  />
                  <Area
                    type="monotone"
                    dataKey="protein"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    name="Protein (g)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Breakdown Chart */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Macro Breakdown</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="_id" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                  />
                  <Legend />
                  <Bar dataKey="protein" fill="#3B82F6" name="Protein (g)" />
                  <Bar dataKey="carbs" fill="#10B981" name="Carbs (g)" />
                  <Bar dataKey="fats" fill="#F59E0B" name="Fats (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Workout Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Workout Activity</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="_id" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                  />
                  <Legend />
                  <Bar dataKey="totalDuration" fill="#8B5CF6" name="Duration (min)" />
                  <Bar dataKey="totalCaloriesBurned" fill="#EF4444" name="Calories Burned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}