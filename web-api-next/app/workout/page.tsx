"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createWorkoutLogAction } from "./actions";
import { getWorkoutRecommendation } from "@/lib/api/recommendations";
import { Workout, WorkoutRecommendation } from "@/lib/api/types";

export default function WorkoutPage() {
  const [data, setData] = useState<WorkoutRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await getWorkoutRecommendation();
        if (result.success) setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout recommendations");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const addToLog = async (workout: Workout) => {
    setSavingId(workout._id);
    try {
      await createWorkoutLogAction({ workoutId: workout._id, duration: workout.duration });
    } finally {
      setSavingId("");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading workout recommendations...</div>;

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Workout Recommendations</h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
          <Link href="/profile" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
            Complete health profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Recommendations</h1>
          <p className="text-sm text-gray-600">Goal: {data?.goal || "not set"} - Activity: {data?.activityLevel || "not set"}</p>
        </div>

        {data?.contentWarning && <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">{data.contentWarning}</div>}

        <section className="grid gap-4 md:grid-cols-2">
          {data?.workouts.length ? data.workouts.map((workout) => (
            <article key={workout._id} className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{workout.name}</h2>
                  <p className="text-sm text-gray-500">{workout.category} - {workout.difficulty}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void addToLog(workout)}
                  disabled={savingId === workout._id}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-gray-300"
                >
                  {savingId === workout._id ? "Adding..." : "Add to log"}
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-600">{workout.description || "No description provided."}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                <span>{workout.duration} min</span>
                <span>{workout.caloriesBurned} kcal</span>
                <span>Sets: {workout.sets || "-"}</span>
                <span>Reps: {workout.reps || "-"}</span>
                <span>Rest: {workout.restSeconds || 0}s</span>
                <span>Equipment: {workout.equipment || "None"}</span>
              </div>
              {workout.instructions?.length ? (
                <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-gray-600">
                  {workout.instructions.map((step) => <li key={step}>{step}</li>)}
                </ol>
              ) : null}
            </article>
          )) : <p className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">No suitable workouts found yet.</p>}
        </section>
      </div>
    </main>
  );
}
