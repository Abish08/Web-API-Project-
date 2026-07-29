"use server";

import { getTokenCookie } from "@/lib/cookies";
import { apiUrl } from "@/lib/api/server";

export async function getWorkoutLogsAction(date: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl(`/api/v1/workout-logs?date=${date}`), {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to fetch workout logs" };
  }
}

export async function createWorkoutLogAction(logData: { workoutId: string; duration: number; date?: string }) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl("/api/v1/workout-logs"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(logData),
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to create workout log" };
  }
}

export async function deleteWorkoutLogAction(id: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl(`/api/v1/workout-logs/${id}`), {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to delete workout log" };
  }
}

export async function searchWorkoutsAction(query: string) {
  try {
    const response = await fetch(apiUrl(`/api/v1/workouts/search?query=${query}`));
    return await response.json();
  } catch {
    return { success: false, message: "Failed to search workouts" };
  }
}
