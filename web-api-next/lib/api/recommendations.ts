import apiClient from "./axios-instance";
import { API } from "./endpoints";
import { ApiResponse, DietRecommendation, getErrorMessage, WeeklyPlan, WorkoutRecommendation } from "./types";

export const getDietRecommendation = async (): Promise<ApiResponse<DietRecommendation>> => {
  try {
    const response = await apiClient.get(API.RECOMMENDATIONS.DIET);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to load diet recommendations"));
  }
};

export const getWorkoutRecommendation = async (): Promise<ApiResponse<WorkoutRecommendation>> => {
  try {
    const response = await apiClient.get(API.RECOMMENDATIONS.WORKOUTS);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to load workout recommendations"));
  }
};

export const getWeeklyPlan = async (): Promise<ApiResponse<WeeklyPlan>> => {
  try {
    const response = await apiClient.get(API.RECOMMENDATIONS.WEEKLY_PLAN);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to load weekly plan"));
  }
};
