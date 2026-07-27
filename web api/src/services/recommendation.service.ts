import { Food, IFood } from "../models/food.model";
import { Workout, IWorkout } from "../models/workout.model";
import { HealthProfileRepository } from "../repositories/healthProfile.repository";
import { CustomHttpException } from "../exceptions/http-exception";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

type MealTotal = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const emptyTotal = (): MealTotal => ({ calories: 0, protein: 0, carbs: 0, fats: 0 });

const addFood = (total: MealTotal, food: IFood) => {
  total.calories += food.calories;
  total.protein += food.protein;
  total.carbs += food.carbs;
  total.fats += food.fats;
};

export class RecommendationService {
  private healthRepo = new HealthProfileRepository();

  private async getProfile(userId: string) {
    const profile = await this.healthRepo.getByUserId(userId);
    if (!profile) {
      throw new CustomHttpException(404, "Health profile is required before recommendations can be generated");
    }
    return profile;
  }

  async getDietRecommendation(userId: string, offset = 0) {
    const profile = await this.getProfile(userId);
    const foods = await Food.find({
      isApproved: true,
      isActive: { $ne: false },
      $or: [{ suitableGoals: { $exists: false } }, { suitableGoals: { $size: 0 } }, { suitableGoals: profile.goal }],
    }).sort({ name: 1 });

    const meals: Record<string, IFood[]> = {};
    const mealTotals: Record<string, MealTotal> = {};
    const dailyTotals = emptyTotal();

    for (const mealType of mealTypes) {
      const candidates = foods.filter((food) => food.category === mealType);
      const selected = candidates.length ? [candidates[offset % candidates.length]] : [];
      meals[mealType.toLowerCase()] = selected;
      mealTotals[mealType.toLowerCase()] = emptyTotal();
      selected.forEach((food) => {
        addFood(mealTotals[mealType.toLowerCase()], food);
        addFood(dailyTotals, food);
      });
    }

    return {
      targets: {
        calories: profile.targetCalories,
        protein: profile.macros.protein,
        carbs: profile.macros.carbs,
        fats: profile.macros.fats,
      },
      meals,
      mealTotals,
      dailyTotals,
      differenceFromTarget: {
        calories: dailyTotals.calories - profile.targetCalories,
        protein: dailyTotals.protein - profile.macros.protein,
        carbs: dailyTotals.carbs - profile.macros.carbs,
        fats: dailyTotals.fats - profile.macros.fats,
      },
      contentWarning: foods.length < 4 ? "Add more foods for better recommendations." : undefined,
    };
  }

  async getWorkoutRecommendation(userId: string, offset = 0) {
    const profile = await this.getProfile(userId);
    const preferredDifficulty =
      profile.activityLevel === "sedentary" || profile.activityLevel === "light"
        ? "Beginner"
        : profile.activityLevel === "moderate"
          ? "Intermediate"
          : "Advanced";

    const workouts = await Workout.find({
      isApproved: true,
      isActive: { $ne: false },
      $or: [{ goalTags: { $exists: false } }, { goalTags: { $size: 0 } }, { goalTags: profile.goal }],
    }).sort({ difficulty: 1, name: 1 });

    const preferred = workouts.filter((workout) => workout.difficulty === preferredDifficulty);
    const pool = preferred.length ? preferred : workouts;
    const selected = pool.slice(offset, offset + 5);
    const workoutsForResponse = selected.length ? selected : pool.slice(0, 5);

    return {
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      workouts: workoutsForResponse,
      estimatedCaloriesBurned: workoutsForResponse.reduce((total, workout) => total + workout.caloriesBurned, 0),
      contentWarning: workouts.length < 3 ? "Add more workouts for better recommendations." : undefined,
    };
  }

  async getWeeklyPlan(userId: string) {
    const week: Record<string, unknown> = {};

    for (let index = 0; index < days.length; index += 1) {
      const diet = await this.getDietRecommendation(userId, index);
      const workout =
        index === 3 || index === 6
          ? { restDay: true, message: "Recovery day" }
          : await this.getWorkoutRecommendation(userId, index);

      week[days[index]] = {
        meals: diet.meals,
        mealTotals: diet.mealTotals,
        dailyTotals: diet.dailyTotals,
        workout,
      };
    }

    return week;
  }
}
