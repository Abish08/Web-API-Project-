"use client";

import { useCallback, useEffect, useState } from "react";
import { createFoodLogAction, deleteFoodLogAction, getDailyLogsAction, searchFoodsAction } from "./actions";
import { Food, FoodLog, MacroTotals } from "@/lib/api/types";

const emptySummary: MacroTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

export default function LogPage() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [summary, setSummary] = useState<MacroTotals>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await getDailyLogsAction(today);
      if (result.success) {
        setLogs(result.data || []);
        setSummary(result.summary || emptySummary);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLogs]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length <= 2) {
      setSearchResults([]);
      return;
    }

    const result = await searchFoodsAction(query);
    setSearchResults(result.success ? result.data || [] : []);
  };

  const handleAddLog = async () => {
    if (!selectedFood) return;

    const result = await createFoodLogAction({ foodId: selectedFood._id, servings, mealType });
    if (result.success) {
      setSelectedFood(null);
      setSearchQuery("");
      setSearchResults([]);
      setServings(1);
      void loadLogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this food log?")) return;
    const result = await deleteFoodLogAction(id);
    if (result.success) void loadLogs();
  };

  if (loading) return <div className="p-8 text-center">Loading logs...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Logs</h1>
          <p className="text-sm text-gray-600">Track today&apos;s meals and nutrition totals.</p>
        </div>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Calories", summary.calories],
            ["Protein", summary.protein],
            ["Carbs", summary.carbs],
            ["Fats", summary.fats],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(Number(value))}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Food</h2>
          <div className="grid gap-3 md:grid-cols-[1fr_120px_160px_auto]">
            <input
              value={searchQuery}
              onChange={(event) => void handleSearch(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2"
              placeholder="Search foods..."
              aria-label="Search foods"
            />
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={servings}
              onChange={(event) => setServings(Number(event.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2"
              aria-label="Servings"
            />
            <select value={mealType} onChange={(event) => setMealType(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal) => <option key={meal}>{meal}</option>)}
            </select>
            <button type="button" onClick={() => void handleAddLog()} disabled={!selectedFood} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:bg-gray-300">
              Add
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 divide-y rounded-lg border border-gray-100">
              {searchResults.map((food) => (
                <button key={food._id} type="button" onClick={() => setSelectedFood(food)} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-green-50">
                  <span>{food.name}</span>
                  <span>{food.calories} kcal</span>
                </button>
              ))}
            </div>
          )}
          {selectedFood && <p className="mt-3 text-sm text-green-700">Selected: {selectedFood.name}</p>}
        </section>

        <section className="rounded-lg bg-white shadow-sm">
          {logs.length ? logs.map((log) => (
            <div key={log._id} className="flex items-center justify-between border-b border-gray-100 p-4 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{typeof log.foodId === "object" ? log.foodId.name : "Food"}</p>
                <p className="text-sm text-gray-500">{log.mealType} - {log.servings} serving(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{Math.round(log.totalCalories)} kcal</span>
                <button type="button" onClick={() => void handleDelete(log._id)} className="text-sm font-medium text-red-600">Delete</button>
              </div>
            </div>
          )) : <p className="p-8 text-center text-sm text-gray-500">No food logged today.</p>}
        </section>
      </div>
    </main>
  );
}
