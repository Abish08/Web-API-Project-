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
}

interface HealthProfile {
  dailyCalorieTarget: number;
  proteinTarget: number;
  bmi?: number;
  goal?: string;
}

export default function MealsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("Breakfast");
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    dailyCalorieTarget: 2000,
    proteinTarget: 150,
  });
  const [consumedCalories, setConsumedCalories] = useState(1200);
  const [consumedProtein, setConsumedProtein] = useState(85);
  const [consumedCarbs, setConsumedCarbs] = useState(142);

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  useEffect(() => {
    loadFoods();
    loadHealthProfile();
    loadTodayConsumption();
  }, [selectedMealType]);

  const loadHealthProfile = async () => {
    try {
      const response = await fetch("http://localhost:8089/api/v1/health-profile", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setHealthProfile({
          dailyCalorieTarget: data.data.dailyCalorieTarget || 2000,
          proteinTarget: data.data.proteinTarget || 150,
          bmi: data.data.bmi,
          goal: data.data.goal,
        });
      }
    } catch (error) {
      console.error("Failed to load health profile:", error);
    }
  };

  const loadTodayConsumption = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`http://localhost:8089/api/v1/food-logs?date=${today}`);
      const data = await response.json();
      if (data.success && data.summary) {
        setConsumedCalories(data.summary.calories || 0);
        setConsumedProtein(data.summary.protein || 0);
        setConsumedCarbs(data.summary.carbs || 0);
      }
    } catch (error) {
      console.error("Failed to load consumption:", error);
    }
  };

  const loadFoods = async () => {
    setLoading(true);
    try {
      const result = await fetchFoodsAction(selectedMealType.toLowerCase());
      if (result.success) {
        // Get 3-4 random foods for recommendations
        const shuffled = result.data.sort(() => 0.5 - Math.random());
        setFoods(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const calorieProgress = Math.min((consumedCalories / healthProfile.dailyCalorieTarget) * 100, 100);
  const proteinProgress = Math.min((consumedProtein / healthProfile.proteinTarget) * 100, 100);
  const carbsProgress = Math.min((consumedCarbs / 250) * 100, 100); // Assuming 250g carb target

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Daily Nutrition Plan</h1>
          <p className="text-gray-600">
            Expertly curated meal recommendations based on your metabolic profile and fitness goals
          </p>
        </div>

        {/* Targets */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{healthProfile.dailyCalorieTarget}</p>
            <p className="text-xs text-gray-500 uppercase">Target Kcal</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{healthProfile.proteinTarget}g</p>
            <p className="text-xs text-gray-500 uppercase">Protein Goal</p>
          </div>
        </div>

        {/* Meal Type Tabs */}
        <div className="flex gap-2 mb-6">
          {mealTypes.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMealType(meal)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedMealType === meal
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {meal}
            </button>
          ))}
        </div>

        {/* Recommended Meals Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading recommendations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {foods.map((food, index) => (
              <div key={food._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100">
                {index === 0 && (
                  <div className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-br-lg inline-block">
                    Recommended
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{food.name}</h3>
                    <span className="text-sm font-semibold text-gray-900">{food.calories} kcal</span>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                      {food.protein}g Protein
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {food.carbs}g Carbs
                    </span>
                  </div>

                  <button
                    onClick={() => {/* Add to log */}}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Log Meal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Daily Breakdown & Macros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">DAILY BREAKDOWN</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#166534"
                    strokeWidth="3"
                    strokeDasharray={`${calorieProgress}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{Math.round(calorieProgress)}%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Consumed {Math.round(consumedCalories)} of {healthProfile.dailyCalorieTarget} kcal
            </p>
          </div>

          {/* Macronutrient Balance */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">MACRONUTRIENT BALANCE</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Proteins</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(consumedProtein)}g / {healthProfile.proteinTarget}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${proteinProgress}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Carbohydrates</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(consumedCarbs)}g / 210g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${carbsProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}