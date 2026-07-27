"use server";

import { getTokenCookie } from "@/lib/cookies";
import { apiUrl } from "@/lib/api/server";
import { Workout } from "@/lib/api/types";

type WorkoutPayload = Partial<Workout>;

export async function fetchWorkoutsAction(search: string = "", category: string = "all") {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category !== "all") params.append("category", category);

    const response = await fetch(apiUrl(`/api/v1/workouts?${params}`), {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to fetch workouts" };
  }
}

export async function createWorkoutAction(workoutData: WorkoutPayload) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl("/api/v1/workouts"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(workoutData),
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to create workout" };
  }
}

export async function updateWorkoutAction(id: string, workoutData: WorkoutPayload) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl(`/api/v1/workouts/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(workoutData),
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to update workout" };
  }
}

export async function deleteWorkoutAction(id: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await fetch(apiUrl(`/api/v1/workouts/${id}`), {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    return await response.json();
  } catch {
    return { success: false, message: "Failed to delete workout" };
  }
}
