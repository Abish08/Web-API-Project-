import { WorkoutLog, IWorkoutLog } from "../models/workoutLog.model";
import mongoose from "mongoose";

export class WorkoutLogRepository {
  async create(logData: Partial<IWorkoutLog>): Promise<IWorkoutLog> {
    const log = new WorkoutLog(logData);
    return await log.save();
  }

  async findByUserAndDate(userId: string, date: Date): Promise<IWorkoutLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await WorkoutLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("workoutId", "name category")
      .sort({ date: -1 });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    if (!mongoose.Types.ObjectId.isValid(userId)) return false;
    const result = await WorkoutLog.findOneAndDelete({
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

    const logs = await WorkoutLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    return logs.reduce(
      (acc, log) => {
        acc.duration += log.duration;
        acc.calories += log.caloriesBurned;
        return acc;
      },
      { duration: 0, calories: 0 }
    );
  }
}
