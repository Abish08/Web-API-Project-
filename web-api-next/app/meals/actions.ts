"use server";

import { getTokenCookie } from "@/lib/cookies";

export async function fetchFoodsAction(category: string = "all") {
  try {
    const params = new URLSearchParams();
    if (category !== "all") params.append("category", category);

    const response = await fetch(`http://localhost:8089/api/v1/foods?${params}`, {
      cache: "no-store",
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to fetch foods" };
  }
}

// Add this new function to log food directly from the Meals page
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