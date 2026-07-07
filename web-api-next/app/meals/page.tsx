"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  fetchFoodsAction, 
  createFoodLogAction, 
  getUserHealthProfileAction,
  getTodayConsumptionAction 
} from "./actions";

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
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  bmi?: number;
  goal?: string;
  activityLevel?: string;
}

export default function MealsPage() {
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState("All");
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    targetCalories: 2000,
    macros: { protein: 150, carbs: 250, fats: 70 },
  });
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [consumedProtein, setConsumedProtein] = useState(0);
  const [consumedCarbs, setConsumedCarbs] = useState(0);
  const [consumedFats, setConsumedFats] = useState(0);

  const mealTypes = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load health profile
      const profileResult = await getUserHealthProfileAction();
      if (profileResult.success && profileResult.data) {
        setHealthProfile({
          targetCalories: profileResult.data.targetCalories || 2000,
          macros: profileResult.data.macros || { protein: 150, carbs: 250, fats: 70 },
          bmi: profileResult.data.bmi,
          goal: profileResult.data.goal,
          activityLevel: profileResult.data.activityLevel,
        });
      }

      // Load today's consumption
      const consumptionResult = await getTodayConsumptionAction();
      if (consumptionResult.success && consumptionResult.summary) {
        setConsumedCalories(consumptionResult.summary.calories || 0);
        setConsumedProtein(consumptionResult.summary.protein || 0);
        setConsumedCarbs(consumptionResult.summary.carbs || 0);
        setConsumedFats(consumptionResult.summary.fats || 0);
      }

      // Load all foods
      const foodsResult = await fetchFoodsAction();
      if (foodsResult.success) {
        setAllFoods(foodsResult.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate personalized meal recommendations
  const generateMealRecommendations = () => {
    const remainingCalories = healthProfile.targetCalories - consumedCalories;
    const remainingProtein = healthProfile.macros.protein - consumedProtein;

    // Distribute remaining calories across meals
    const breakfastTarget = Math.round(remainingCalories * 0.25);
    const lunchTarget = Math.round(remainingCalories * 0.35);
    const dinnerTarget = Math.round(remainingCalories * 0.30);
    const snackTarget = Math.round(remainingCalories * 0.10);

    const recommendations: any[] = [];

    const findFoodsForMeal = (targetCalories: number, category: string): Food[] => {
      const categoryFoods = allFoods.filter(f => 
        f.category.toLowerCase() === category.toLowerCase()
      );
      return categoryFoods
        .sort((a, b) => Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories))
        .slice(0, 3);
    };

    if (selectedMealType === "All" || selectedMealType === "Breakfast") {
      recommendations.push({
        mealType: "Breakfast",
        targetCalories: breakfastTarget,
        targetProtein: Math.round(remainingProtein * 0.25),
        suggestedFoods: findFoodsForMeal(breakfastTarget, "Breakfast"),
      });
    }

    if (selectedMealType === "All" || selectedMealType === "Lunch") {
      recommendations.push({
        mealType: "Lunch",
        targetCalories: lunchTarget,
        targetProtein: Math.round(remainingProtein * 0.35),
        suggestedFoods: findFoodsForMeal(lunchTarget, "Lunch"),
      });
    }

    if (selectedMealType === "All" || selectedMealType === "Dinner") {
      recommendations.push({
        mealType: "Dinner",
        targetCalories: dinnerTarget,
        targetProtein: Math.round(remainingProtein * 0.30),
        suggestedFoods: findFoodsForMeal(dinnerTarget, "Dinner"),
      });
    }

    if (selectedMealType === "All" || selectedMealType === "Snacks") {
      recommendations.push({
        mealType: "Snacks",
        targetCalories: snackTarget,
        targetProtein: Math.round(remainingProtein * 0.10),
        suggestedFoods: findFoodsForMeal(snackTarget, "Snacks"),
      });
    }

    return recommendations;
  };

  const handleLogMeal = async (food: Food, mealType: string) => {
    const result = await createFoodLogAction({
      foodId: food._id,
      servings: 1,
      mealType,
    });
    
    if (result.success) {
      alert(`${food.name} logged for ${mealType}!`);
      loadData();
    } else {
      alert(result.message || "Failed to log meal");
    }
  };

  const recommendations = generateMealRecommendations();
  const remainingCalories = healthProfile.targetCalories - consumedCalories;
  const remainingProtein = healthProfile.macros.protein - consumedProtein;
  const calorieProgress = Math.min((consumedCalories / healthProfile.targetCalories) * 100, 100);
  const proteinProgress = Math.min((consumedProtein / healthProfile.macros.protein) * 100, 100);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Nutrition Plan</h1>
          <p className="text-gray-600">
            AI-powered meal recommendations based on your health profile and goals
          </p>
        </div>

        {/* Daily Targets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Remaining Calories</p>
            <p className={`text-2xl font-bold ${remainingCalories > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.round(remainingCalories)}
            </p>
            <p className="text-xs text-gray-500">of {healthProfile.targetCalories} kcal</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Remaining Protein</p>
            <p className={`text-2xl font-bold ${remainingProtein > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
              {Math.round(remainingProtein)}g
            </p>
            <p className="text-xs text-gray-500">of {healthProfile.macros.protein}g</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">BMI</p>
            <p className="text-2xl font-bold text-gray-900">{healthProfile.bmi?.toFixed(1) || "N/A"}</p>
            <p className="text-xs text-gray-500">{healthProfile.goal || "Maintain"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Activity Level</p>
            <p className="text-2xl font-bold text-gray-900">{healthProfile.activityLevel || "Moderate"}</p>
            <p className="text-xs text-gray-500">Active lifestyle</p>
          </div>
        </div>

        {/* Meal Type Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {mealTypes.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMealType(meal)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedMealType === meal
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {meal}
            </button>
          ))}
        </div>

        {/* Personalized Meal Recommendations */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Generating your personalized meal plan...</div>
        ) : (
          <div className="space-y-8">
            {recommendations.map((recommendation) => (
              <div key={recommendation.mealType} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{recommendation.mealType}</h3>
                    <p className="text-sm text-gray-600">
                      Target: {recommendation.targetCalories} kcal • {recommendation.targetProtein}g protein
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Recommended for you
                  </span>
                </div>

                {recommendation.suggestedFoods.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">
                    No foods available for this category. Add more foods in the admin panel!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendation.suggestedFoods.map((food: Food) => (
                      <div key={food._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-2">{food.name}</h4>
                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>Calories:</span>
                            <span className="font-semibold">{food.calories} kcal</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein:</span>
                            <span className="font-semibold text-blue-600">{food.protein}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbs:</span>
                            <span className="font-semibold text-green-600">{food.carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fats:</span>
                            <span className="font-semibold text-yellow-600">{food.fats}g</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLogMeal(food, recommendation.mealType)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                        >
                          Log This Meal
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Daily Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Calorie Progress */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">DAILY CALORIE PROGRESS</h3>
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
              Consumed {Math.round(consumedCalories)} of {healthProfile.targetCalories} kcal
            </p>
          </div>

          {/* Macro Progress */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">MACRONUTRIENT PROGRESS</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Protein</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(consumedProtein)}g / {healthProfile.macros.protein}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${proteinProgress}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Carbohydrates</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(consumedCarbs)}g / {healthProfile.macros.carbs}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((consumedCarbs / healthProfile.macros.carbs) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Fats</span>
                  <span className="text-sm font-medium text-gray-900">{Math.round(consumedFats)}g / {healthProfile.macros.fats}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min((consumedFats / healthProfile.macros.fats) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}