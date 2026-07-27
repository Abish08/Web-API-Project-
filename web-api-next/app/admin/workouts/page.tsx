"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiUrl } from "@/lib/api/server";
import { Workout } from "@/lib/api/types";

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/v1/workouts"), { credentials: "include" });
      const data = await response.json();
      if (data.success) setWorkouts(data.data);
    } catch {
      toast.error("Failed to fetch workouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchWorkouts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchWorkouts]);

  const filteredWorkouts = useMemo(
    () => workouts.filter((workout) => workout.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [workouts, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const response = await fetch(apiUrl(`/api/v1/workouts/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Workout deleted successfully");
        void fetchWorkouts();
      } else {
        toast.error(data.message || "Failed to delete workout");
      }
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  if (loading) return <div className="py-12 text-center">Loading workouts...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Management</h1>
          <p className="text-sm text-gray-600">Manage the workout library</p>
        </div>
        <Link href="/admin/workouts/add" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          Add Workout
        </Link>
      </div>

      <input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2"
        placeholder="Search workouts..."
        aria-label="Search workouts"
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Category", "Difficulty", "Duration", "Calories", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWorkouts.map((workout) => (
              <tr key={workout._id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{workout.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{workout.category}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{workout.difficulty}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{workout.duration} min</td>
                <td className="px-4 py-3 text-sm text-gray-600">{workout.caloriesBurned}</td>
                <td className="space-x-3 px-4 py-3 text-sm">
                  <Link href={`/admin/workouts/${workout._id}/edit`} className="font-medium text-green-700">Edit</Link>
                  <button type="button" onClick={() => void handleDelete(workout._id)} className="font-medium text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredWorkouts.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No workouts found.</p>}
      </div>
    </div>
  );
}
