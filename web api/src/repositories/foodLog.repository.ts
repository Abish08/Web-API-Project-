import { FoodLog, IFoodLog } from "../models/foodLog.model";
import mongoose from "mongoose";

export class FoodLogRepository {
  async create(logData: Partial<IFoodLog>): Promise<IFoodLog> {
    const log = new FoodLog(logData);
    return await log.save();
  }

  async findByUserAndDate(userId: string, date: Date): Promise<IFoodLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await FoodLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("foodId", "name category servingSize")
      .sort({ date: -1 });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    if (!mongoose.Types.ObjectId.isValid(userId)) return false;
    const result = await FoodLog.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
    return !!result;
  }

  async getDailySummary(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const summary = logs.reduce(
      (acc, log) => {
        acc.calories += log.totalCalories;
        acc.protein += log.totalProtein;
        acc.carbs += log.totalCarbs;
        acc.fats += log.totalFats;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return summary;
  }
}
