"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Workout {
  _id: string;
  name: string;
  category: string;
  duration: number;
  caloriesBurned: number;
  difficulty: string;
  description?: string;
  equipment?: string;
}

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, [search, categoryFilter]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await fetch(`http://localhost:8089/api/v1/workouts?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setWorkouts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Cardio", "Strength", "Flexibility", "Yoga", "HIIT", "Sports", "Other"];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-yellow-100 text-yellow-700";
      case "Advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-gray-900">NutriNepal</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 text-sm font-medium">Home</Link>
              <Link href="/meals" className="text-gray-600 hover:text-green-600 text-sm font-medium">Meals</Link>
              <Link href="/workout" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Workout</Link>
              <Link href="/log" className="text-gray-600 hover:text-green-600 text-sm font-medium">Log</Link>
              <Link href="/progress" className="text-gray-600 hover:text-green-600 text-sm font-medium">Progress</Link>
              <Link href="/profile" className="text-gray-600 hover:text-green-600 text-sm font-medium">Profile</Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-green-600">Login</Link>
              <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Workout Library</h1>
          <p className="text-green-100 text-lg">
            Browse our collection of exercises and workouts designed for all fitness levels
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search workouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Workouts Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading workouts...</div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No workouts found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                onClick={() => setSelectedWorkout(workout)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{workout.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                </div>

                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mb-4">
                  {workout.category}
                </span>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold text-gray-900">{workout.duration} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-semibold text-gray-900">{workout.caloriesBurned} kcal</span>
                  </div>
                  {workout.equipment && (
                    <div className="flex justify-between">
                      <span>Equipment:</span>
                      <span className="font-semibold text-gray-900">{workout.equipment}</span>
                    </div>
                  )}
                </div>

                {workout.description && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">{workout.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setSelectedWorkout(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedWorkout.difficulty)} mb-2`}>
                {selectedWorkout.difficulty}
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 ml-2">
                {selectedWorkout.category}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedWorkout.name}</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <p className="text-xl font-bold text-gray-900">{selectedWorkout.duration} <span className="text-sm font-normal">mins</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Calories</p>
                <p className="text-xl font-bold text-gray-900">{selectedWorkout.caloriesBurned} <span className="text-sm font-normal">kcal</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Equipment</p>
                <p className="text-xl font-bold text-gray-900">{selectedWorkout.equipment || "None"}</p>
              </div>
            </div>

            {selectedWorkout.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedWorkout.description}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedWorkout(null)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}