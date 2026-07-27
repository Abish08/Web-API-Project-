import { Food } from "../models/food.model";
import { FoodLog } from "../models/foodLog.model";
import { HealthProfile } from "../models/healthProfile.model";
import { UserCollection } from "../models/user.model";
import { Workout } from "../models/workout.model";
import { WorkoutLog } from "../models/workoutLog.model";

export class AdminStatsService {
  async getStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalFoods,
      totalWorkouts,
      totalFoodLogs,
      totalWorkoutLogs,
      usersByGoal,
      usersByActivityLevel,
      recentRegistrations,
      foodLogsLastSevenDays,
      workoutLogsLastSevenDays,
      mostLoggedFoods,
      mostLoggedWorkouts,
    ] = await Promise.all([
      UserCollection.countDocuments(),
      Food.countDocuments({ isApproved: true }),
      Workout.countDocuments({ isApproved: true }),
      FoodLog.countDocuments(),
      WorkoutLog.countDocuments(),
      HealthProfile.aggregate([{ $group: { _id: "$goal", count: { $sum: 1 } } }]),
      HealthProfile.aggregate([{ $group: { _id: "$activityLevel", count: { $sum: 1 } } }]),
      UserCollection.find().sort({ createdAt: -1 }).limit(5),
      FoodLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      WorkoutLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      FoodLog.aggregate([
        { $group: { _id: "$foodId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "foods", localField: "_id", foreignField: "_id", as: "food" } },
        { $unwind: "$food" },
        { $project: { _id: 0, foodId: "$_id", name: "$food.name", count: 1 } },
      ]),
      WorkoutLog.aggregate([
        { $group: { _id: "$workoutId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "workouts", localField: "_id", foreignField: "_id", as: "workout" } },
        { $unwind: "$workout" },
        { $project: { _id: 0, workoutId: "$_id", name: "$workout.name", count: 1 } },
      ]),
    ]);

    return {
      totalUsers,
      activeUsers: totalUsers,
      totalFoods,
      totalWorkouts,
      totalFoodLogs,
      totalWorkoutLogs,
      usersByGoal,
      usersByActivityLevel,
      recentRegistrations,
      logsLastSevenDays: {
        food: foodLogsLastSevenDays,
        workout: workoutLogsLastSevenDays,
      },
      mostLoggedFoods,
      mostLoggedWorkouts,
    };
  }
}
