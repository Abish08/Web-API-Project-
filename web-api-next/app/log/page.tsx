"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDailyLogsAction, createFoodLogAction, deleteFoodLogAction, searchFoodsAction } from "./actions";

interface FoodLog {
  _id: string;
  foodId: { _id: string; name: string; category: string };
  servings: number;
  mealType: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export default function LogPage() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [summary, setSummary] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await getDailyLogsAction(today);
      if (result.success) {
        setLogs(result.data);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const result = await searchFoodsAction(query);
      if (result.success) setSearchResults(result.data);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddLog = async () => {
    if (!selectedFood) return alert("Please select a food");
    try {
      const result = await createFoodLogAction({
        foodId: selectedFood._id,
        servings,
        mealType,
      });
      if (result.success) {
        setShowModal(false);
        setSelectedFood(null);
        setSearchQuery("");
        setServings(1);
        loadLogs();
      } else {
        alert(result.message || "Failed to add log");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this food log?")) return;
    try {
      const result = await deleteFoodLogAction(id);
      if (result.success) loadLogs();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const getMealColor = (meal: string) => {
    switch (meal) {
      case "Breakfast": return "bg-yellow-100 text-yellow-700";
      case "Lunch": return "bg-green-100 text-green-700";
      case "Dinner": return "bg-blue-100 text-blue-700";
      case "Snack": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
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
              <Link href="/log" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Log</Link>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daily Food Log</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            + Add Food
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Calories</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.calories)} <span className="text-sm font-normal text-gray-500">kcal</span></p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Protein</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.protein)} <span className="text-sm font-normal text-gray-500">g</span></p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Carbs</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.carbs)} <span className="text-sm font-normal text-gray-500">g</span></p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Fats</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.fats)} <span className="text-sm font-normal text-gray-500">g</span></p>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            No food logged today. Click "+ Add Food" to start tracking!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMealColor(log.mealType)}`}>
                      {log.mealType}
                    </span>
                    <h3 className="font-semibold text-gray-900">{log.foodId?.name || "Unknown Food"}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {log.servings} serving(s) • {Math.round(log.totalCalories)} kcal • P: {Math.round(log.totalProtein)}g • C: {Math.round(log.totalCarbs)}g • F: {Math.round(log.totalFats)}g
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(log._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Food Log</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Food</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="e.g., Dal Bhat"
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((food) => (
                      <div
                        key={food._id}
                        onClick={() => { setSelectedFood(food); setSearchQuery(food.name); setSearchResults([]); }}
                        className={`p-2 cursor-pointer hover:bg-gray-50 ${selectedFood?._id === food._id ? 'bg-green-50' : ''}`}
                      >
                        <p className="font-medium text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.calories} kcal per {food.servingSize}g</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={servings}
                    onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300">Cancel</button>
                <button onClick={handleAddLog} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Save Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}