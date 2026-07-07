"use server";

import { getTokenCookie } from "@/lib/cookies";

export async function getTodayFoodSummaryAction() {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`http://localhost:8089/api/v1/food-logs?date=${today}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to fetch food summary" };
  }
}

export async function getTodayWorkoutSummaryAction() {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`http://localhost:8089/api/v1/workout-logs?date=${today}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to fetch workout summary" };
  }
}