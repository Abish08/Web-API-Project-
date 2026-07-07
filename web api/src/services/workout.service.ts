import { WorkoutRepository } from "../repositories/workout.repository";
import { IWorkout } from "../models/workout.model";

export class WorkoutService {
  private repo: WorkoutRepository;

  constructor() {
    this.repo = new WorkoutRepository();
  }

  async createWorkout(workoutData: Partial<IWorkout>): Promise<IWorkout> {
    if (workoutData.duration! <= 0 || workoutData.caloriesBurned! < 0) {
      throw new Error("Duration must be positive and calories cannot be negative");
    }
    return await this.repo.create(workoutData);
  }

  async getAllWorkouts(page: number, limit: number, search?: string, category?: string) {
    return await this.repo.findAll(page, limit, search, category);
  }

  async getWorkoutById(id: string): Promise<IWorkout | null> {
    const workout = await this.repo.findById(id);
    if (!workout) throw new Error("Workout not found");
    return workout;
  }

  async updateWorkout(id: string, updateData: Partial<IWorkout>): Promise<IWorkout> {
    const workout = await this.repo.update(id, updateData);
    if (!workout) throw new Error("Workout not found or update failed");
    return workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new Error("Workout not found or delete failed");
  }

  async getWorkoutsByCategory(category: string): Promise<IWorkout[]> {
    return await this.repo.findByCategory(category);
  }

  async searchWorkouts(query: string): Promise<IWorkout[]> {
    return await this.repo.searchWorkouts(query);
  }

  async getTotalWorkoutsCount(): Promise<number> {
    return await this.repo.getTotalCount();
  }
}