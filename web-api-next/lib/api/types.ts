export type UserRole = "admin" | "user";

export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: UserRole;
  profilePicture?: {
    url: string;
    publicId?: string;
  };
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthProfile {
  _id: string;
  userId: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: MacroTargets;
  updatedAt?: string;
}

export interface MacroTargets {
  protein: number;
  carbs: number;
  fats: number;
}

export interface Food {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  description?: string;
  dietaryTags?: string[];
  allergens?: string[];
  suitableGoals?: string[];
  images?: Array<{ url: string; publicId?: string }>;
  thumbnail?: { url: string; publicId?: string };
}

export interface Workout {
  _id: string;
  name: string;
  category: string;
  duration: number;
  caloriesBurned: number;
  difficulty: string;
  description?: string;
  equipment?: string;
  goalTags?: string[];
  muscleGroups?: string[];
  sets?: number;
  reps?: string;
  restSeconds?: number;
  instructions?: string[];
  media?: Array<{ type: "image" | "video"; url: string; publicId?: string; thumbnail?: string }>;
}

export interface FoodLog {
  _id: string;
  foodId: string | Food;
  servings: number;
  mealType: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface WorkoutLog {
  _id: string;
  workoutId: string | Workout;
  duration: number;
  caloriesBurned: number;
  date: string;
}

export interface DietRecommendation {
  targets: NutritionTargets;
  meals: Record<string, Food[]>;
  mealTotals: Record<string, MacroTotals>;
  dailyTotals: MacroTotals;
  differenceFromTarget: MacroTotals;
  contentWarning?: string;
}

export interface NutritionTargets extends MacroTargets {
  calories: number;
}

export type MacroTotals = NutritionTargets;

export interface WorkoutRecommendation {
  goal: string;
  activityLevel: string;
  workouts: Workout[];
  estimatedCaloriesBurned: number;
  contentWarning?: string;
}

export type WeeklyPlan = Record<
  string,
  {
    meals: Record<string, Food[]>;
    mealTotals: Record<string, MacroTotals>;
    dailyTotals: MacroTotals;
    workout: WorkoutRecommendation | { restDay: true; message: string };
  }
>;

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFoods: number;
  totalWorkouts: number;
  totalFoodLogs: number;
  totalWorkoutLogs: number;
  usersByGoal: Array<{ _id: string; count: number }>;
  usersByActivityLevel: Array<{ _id: string; count: number }>;
  recentRegistrations: User[];
  logsLastSevenDays: { food: number; workout: number };
  mostLoggedFoods: Array<{ foodId: string; name: string; count: number }>;
  mostLoggedWorkouts: Array<{ workoutId: string; name: string; count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: unknown;
  pagination?: unknown;
  summary?: unknown;
}

export type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null) {
    const maybe = error as ApiErrorLike;
    return maybe.response?.data?.message || maybe.message || fallback;
  }

  return fallback;
};
