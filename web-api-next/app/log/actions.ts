"use server";

import { getTokenCookie } from "@/lib/cookies";
import { apiUrl } from "@/lib/api/server";

type FoodLogPayload = {
  foodId: string;
  servings: number;
  mealType: string;
  date?: string;
};

export async function getDailyLogsAction(date: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl(`/api/v1/food-logs?date=${date}`), {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to fetch logs" };
  }
}

export async function createFoodLogAction(logData: FoodLogPayload) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl("/api/v1/food-logs"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(logData),
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to create log" };
  }
}

export async function deleteFoodLogAction(id: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl(`/api/v1/food-logs/${id}`), {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to delete log" };
  }
}

export async function searchFoodsAction(query: string) {
  try {
    const response = await fetch(apiUrl(`/api/v1/foods/search?query=${query}`));
    return await response.json();
  } catch {
    return { success: false, message: "Failed to search foods" };
  }
}
