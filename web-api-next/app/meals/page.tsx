"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDietRecommendation } from "@/lib/api/recommendations";
import { DietRecommendation } from "@/lib/api/types";

export default function MealsPage() {
  const [data, setData] = useState<DietRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await getDietRecommendation();
        if (result.success) setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load diet recommendations");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading meal recommendations...</div>;

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Diet Recommendations</h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
          <Link href="/profile" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
            Complete health profile
          </Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diet Recommendations</h1>
            <p className="text-sm text-gray-600">Rule-based meals matched to your current health profile.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-green-700">Dashboard</Link>
        </div>

        {data.contentWarning && <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">{data.contentWarning}</div>}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Calories", data.targets.calories, "kcal"],
            ["Protein", data.targets.protein, "g"],
            ["Carbs", data.targets.carbs, "g"],
            ["Fat", data.targets.fats, "g"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value} {unit}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {Object.entries(data.meals).map(([meal, foods]) => (
            <div key={meal} className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold capitalize text-gray-900">{meal}</h2>
              {foods.length ? foods.map((food) => (
                <div key={food._id} className="rounded-lg border border-gray-100 p-3">
                  <p className="font-medium text-gray-900">{food.name}</p>
                  <p className="text-sm text-gray-500">{food.servingSize} serving - {food.calories} kcal</p>
                  <p className="text-xs text-gray-400">P {food.protein}g / C {food.carbs}g / F {food.fats}g</p>
                </div>
              )) : <p className="text-sm text-gray-500">No foods available for this meal yet.</p>}
              <p className="mt-3 text-sm text-gray-600">Meal total: {data.mealTotals[meal]?.calories || 0} kcal</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Daily Total</h2>
          <p className="mt-2 text-sm text-gray-600">
            {data.dailyTotals.calories} kcal, {data.dailyTotals.protein}g protein, {data.dailyTotals.carbs}g carbs, {data.dailyTotals.fats}g fat.
          </p>
          <p className="mt-1 text-sm text-gray-500">Difference from target: {data.differenceFromTarget.calories} kcal</p>
        </section>
      </div>
    </main>
  );
}
