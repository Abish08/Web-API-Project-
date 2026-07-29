import { Workout, IWorkout } from "../models/workout.model";
import mongoose from "mongoose";

export class WorkoutRepository {
  async create(workoutData: Partial<IWorkout>): Promise<IWorkout> {
    const workout = new Workout(workoutData);
    return await workout.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<{ workouts: IWorkout[]; total: number }> {
    const query: any = { isApproved: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      Workout.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName"),
      Workout.countDocuments(query),
    ]);

    return { workouts, total };
  }

  async findById(id: string): Promise<IWorkout | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Workout.findById(id).populate("createdBy", "firstName lastName email");
  }

  async update(id: string, updateData: Partial<IWorkout>): Promise<IWorkout | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Workout.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Workout.findByIdAndDelete(id);
    return !!result;
  }

  async findByCategory(category: string): Promise<IWorkout[]> {
    return await Workout.find({ category, isApproved: true }).sort({ name: 1 });
  }

  async searchWorkouts(query: string): Promise<IWorkout[]> {
    return await Workout.find({
      isApproved: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .limit(10)
      .sort({ name: 1 });
  }

  async getTotalCount(): Promise<number> {
    return await Workout.countDocuments({ isApproved: true });
  }
}
