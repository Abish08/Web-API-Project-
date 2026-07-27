"use server";

import { getTokenCookie } from "@/lib/cookies";
import { apiUrl } from "@/lib/api/server";

export async function getCalorieHistoryAction(days: number = 30) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(
      apiUrl(`/api/v1/progress/history/calories?days=${days}`),
      {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      }
    );
    return await response.json();
  } catch {
    return { success: false, message: "Failed to fetch calorie history" };
  }
}

export async function getWorkoutHistoryAction(days: number = 30) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(
      apiUrl(`/api/v1/progress/history/workouts?days=${days}`),
      {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      }
    );
    return await response.json();
  } catch {
    return { success: false, message: "Failed to fetch workout history" };
  }
}

export async function getSummaryAction() {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl("/api/v1/progress/summary"), {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to fetch summary" };
  }
}
