"use server";

import { getTokenCookie } from "@/lib/cookies";

export async function getDailyLogsAction(date: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(`http://localhost:8089/api/v1/food-logs?date=${date}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to fetch logs" };
  }
}

export async function createFoodLogAction(logData: any) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch("http://localhost:8089/api/v1/food-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(logData),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to create log" };
  }
}

export async function deleteFoodLogAction(id: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(`http://localhost:8089/api/v1/food-logs/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to delete log" };
  }
}

export async function searchFoodsAction(query: string) {
  try {
    const response = await fetch(`http://localhost:8089/api/v1/foods/search?query=${query}`);
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to search foods" };
  }
}