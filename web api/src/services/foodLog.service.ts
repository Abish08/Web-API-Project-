import { FoodLogRepository } from "../repositories/foodLog.repository";
import { Food } from "../models/food.model";
import { IFoodLog } from "../models/foodLog.model";

export class FoodLogService {
  private repo: FoodLogRepository;

  constructor() {
    this.repo = new FoodLogRepository();
  }

  async createLog(userId: string, foodId: string, servings: number, mealType: string, date: Date) {
    // 1. Find the base food
    const food = await Food.findById(foodId);
    if (!food) throw new Error("Food not found");

    // 2. Calculate total macros based on servings
    const totalCalories = food.calories * servings;
    const totalProtein = food.protein * servings;
    const totalCarbs = food.carbs * servings;
    const totalFats = food.fats * servings;

    // 3. Create the log
    const logData: Partial<IFoodLog> = {
      userId: new (require("mongoose").Types.ObjectId)(userId),
      foodId: new (require("mongoose").Types.ObjectId)(foodId),
      servings,
      mealType,
      date,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
    };

    return await this.repo.create(logData);
  }

  async getUserLogs(userId: string, date: Date) {
    return await this.repo.findByUserAndDate(userId, date);
  }

  async deleteLog(id: string, userId: string) {
    // Optional: Verify the log belongs to the user before deleting
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new Error("Log not found or delete failed");
    return true;
  }

  async getDailySummary(userId: string, date: Date) {
    return await this.repo.getDailySummary(userId, date);
  }
}