import { WorkoutLogRepository } from "../repositories/workoutLog.repository";
import { Workout } from "../models/workout.model";
import { IWorkoutLog } from "../models/workoutLog.model";
import mongoose from "mongoose";

export class WorkoutLogService {
  private repo: WorkoutLogRepository;

  constructor() {
    this.repo = new WorkoutLogRepository();
  }

  async createLog(userId: string, workoutId: string, duration: number, date: Date) {
    const workout = await Workout.findById(workoutId);
    if (!workout) throw new Error("Workout not found");

    // Calculate calories based on user's actual duration vs base duration
    const ratio = duration / workout.duration;
    const caloriesBurned = workout.caloriesBurned * ratio;

    const logData: Partial<IWorkoutLog> = {
      userId: new mongoose.Types.ObjectId(userId),
      workoutId: new mongoose.Types.ObjectId(workoutId),
      duration,
      caloriesBurned,
      date,
    };

    return await this.repo.create(logData);
  }

  async getUserLogs(userId: string, date: Date) {
    return await this.repo.findByUserAndDate(userId, date);
  }

  async deleteLog(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new Error("Log not found or delete failed");
    return true;
  }

  async getDailySummary(userId: string, date: Date) {
    return await this.repo.getDailySummary(userId, date);
  }
}