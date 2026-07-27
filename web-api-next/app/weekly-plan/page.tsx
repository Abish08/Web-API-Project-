"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWeeklyPlan } from "@/lib/api/recommendations";
import { WeeklyPlan, WorkoutRecommendation } from "@/lib/api/types";

const isWorkoutRecommendation = (value: WeeklyPlan[string]["workout"]): value is WorkoutRecommendation =>
  "workouts" in value;

export default function WeeklyPlanPage() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [activeDay, setActiveDay] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await getWeeklyPlan();
        if (result.success) {
          setPlan(result.data);
          setActiveDay(Object.keys(result.data)[0] || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weekly plan");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading weekly plan...</div>;

  if (error || !plan) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Plan</h1>
          <p className="mt-3 text-sm text-red-600">{error || "No weekly plan available."}</p>
          <Link href="/profile" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">Complete health profile</Link>
        </div>
      </main>
    );
  }

  const days = Object.keys(plan);
  const selected = plan[activeDay];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Plan</h1>
          <p className="text-sm text-gray-600">Seven days of generated meals and workout guidance.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${activeDay === day ? "bg-green-600 text-white" : "bg-white text-gray-700"}`}
            >
              {day}
            </button>
          ))}
        </div>

        {selected && (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Meals</h2>
              {Object.entries(selected.meals).map(([meal, foods]) => (
                <div key={meal} className="mb-4 rounded-lg border border-gray-100 p-3">
                  <h3 className="font-semibold capitalize text-gray-900">{meal}</h3>
                  {foods.length ? foods.map((food) => (
                    <p key={food._id} className="mt-1 text-sm text-gray-600">{food.name} - {food.calories} kcal</p>
                  )) : <p className="mt-1 text-sm text-gray-500">No food assigned.</p>}
                </div>
              ))}
              <p className="text-sm font-semibold text-gray-700">Daily calories: {selected.dailyTotals.calories}</p>
            </div>

            <div className="rounded-lg bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Workout</h2>
              {isWorkoutRecommendation(selected.workout) ? (
                selected.workout.workouts.map((workout) => (
                  <div key={workout._id} className="mb-3 rounded-lg border border-gray-100 p-3">
                    <p className="font-medium text-gray-900">{workout.name}</p>
                    <p className="text-sm text-gray-600">{workout.duration} min - {workout.difficulty}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">{selected.workout.message}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
