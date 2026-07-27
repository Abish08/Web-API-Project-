"use client";

import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCalorieHistoryAction, getSummaryAction, getWorkoutHistoryAction } from "./actions";

type HistoryPoint = {
  date: string;
  calories?: number;
  duration?: number;
};

type ProgressSummary = {
  totalCalories?: number;
  totalWorkoutCalories?: number;
  totalWorkoutDuration?: number;
  averageCalories?: number;
};

export default function ProgressPage() {
  const [calorieHistory, setCalorieHistory] = useState<HistoryPoint[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<HistoryPoint[]>([]);
  const [summary, setSummary] = useState<ProgressSummary>({});
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const [calories, workouts, summaryResult] = await Promise.all([
        getCalorieHistoryAction(30),
        getWorkoutHistoryAction(30),
        getSummaryAction(),
      ]);

      if (calories.success) setCalorieHistory(calories.data || []);
      if (workouts.success) setWorkoutHistory(workouts.data || []);
      if (summaryResult.success) setSummary(summaryResult.data || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProgress();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProgress]);

  if (loading) return <div className="p-8 text-center">Loading progress...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
          <p className="text-sm text-gray-600">Review your calorie intake and workout consistency.</p>
        </div>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Calories", summary.totalCalories || 0],
            ["Avg Calories", summary.averageCalories || 0],
            ["Workout Burn", summary.totalWorkoutCalories || 0],
            ["Workout Minutes", summary.totalWorkoutDuration || 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(Number(value))}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Calorie Intake</h2>
            {calorieHistory.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={calorieHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-12 text-center text-sm text-gray-500">No calorie history yet.</p>}
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Workout Duration</h2>
            {workoutHistory.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={workoutHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-12 text-center text-sm text-gray-500">No workout history yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
