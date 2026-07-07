"use server";

import { getTokenCookie } from "@/lib/cookies";

export async function fetchFoodsAction(search: string = "", category: string = "all") {
  try {
    const token = await getTokenCookie();
    
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category !== "all") params.append("category", category);

    const response = await fetch(`http://localhost:8089/api/v1/foods?${params}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching foods:", error);
    return { success: false, message: "Failed to fetch foods" };
  }
}

export async function createFoodAction(foodData: any) {
  try {
    const token = await getTokenCookie();
    
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch("http://localhost:8089/api/v1/foods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(foodData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating food:", error);
    return { success: false, message: "Failed to create food" };
  }
}

export async function updateFoodAction(id: string, foodData: any) {
  try {
    const token = await getTokenCookie();
    
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`http://localhost:8089/api/v1/foods/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(foodData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating food:", error);
    return { success: false, message: "Failed to update food" };
  }
}

export async function deleteFoodAction(id: string) {
  try {
    const token = await getTokenCookie();
    
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`http://localhost:8089/api/v1/foods/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting food:", error);
    return { success: false, message: "Failed to delete food" };
  }
}