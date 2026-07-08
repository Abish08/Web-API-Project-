import { FoodLog } from "../models/foodLog.model";
import { WorkoutLog } from "../models/workoutLog.model";
import mongoose from "mongoose";

export class ProgressService {
  // Get daily calorie & macro history for the last N days
  async getCalorieHistory(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const foodLogs = await FoodLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          calories: { $sum: "$totalCalories" },
          protein: { $sum: "$totalProtein" },
          carbs: { $sum: "$totalCarbs" },
          fats: { $sum: "$totalFats" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return foodLogs;
  }

  // Get workout history for the last N days
  async getWorkoutHistory(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workoutLogs = await WorkoutLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalDuration: { $sum: "$duration" },
          totalCaloriesBurned: { $sum: "$caloriesBurned" },
          workoutCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return workoutLogs;
  }

  // Get overall summary
  async getSummary(userId: string) {
    const totalFoodLogs = await FoodLog.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });
    const totalWorkoutLogs = await WorkoutLog.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return { totalFoodLogs, totalWorkoutLogs };
  }
}