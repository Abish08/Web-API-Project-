"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchFoodsAction } from "./actions";

interface Food {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description?: string;
}

export default function MealsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [
    "All", "Breakfast", "Lunch", "Dinner", "Snacks", 
    "Beverages", "Fruits", "Vegetables", "Grains", "Protein", "Dairy"
  ];

  useEffect(() => {
    loadFoods();
  }, [categoryFilter]);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const result = await fetchFoodsAction(categoryFilter);
      if (result.success) {
        setFoods(result.data);
      }
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
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
              <Link href="/meals" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Meals</Link>
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

      {/* Header */}
      <div className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Food Database</h1>
          <p className="text-green-100 text-lg">
            Explore our comprehensive database of Nepali and international foods
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === cat.toLowerCase()
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Foods Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading foods...</div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            No foods found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foods.map((food) => (
              <div key={food._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{food.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {food.category}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4">Per {food.servingSize}g serving</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-bold text-gray-900">{food.calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-semibold text-blue-600">{food.protein}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Carbs</span>
                    <span className="font-semibold text-green-600">{food.carbs}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fats</span>
                    <span className="font-semibold text-yellow-600">{food.fats}g</span>
                  </div>
                </div>

                {food.description && (
                  <p className="mt-4 text-xs text-gray-500 line-clamp-2 border-t border-gray-100 pt-3">
                    {food.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}