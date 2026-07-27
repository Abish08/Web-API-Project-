import bcrypt from "bcryptjs";
import { requireEnv } from "./configs/constant";
import { initializeDatabase } from "./database/mongodb";
import { Food } from "./models/food.model";
import { UserCollection } from "./models/user.model";
import { Workout } from "./models/workout.model";
import mongoose from "mongoose";

const foods = [
  { name: "Dal Bhat Set", category: "Lunch", servingSize: 1, calories: 650, protein: 22, carbs: 105, fats: 14, fiber: 12, dietaryTags: ["vegetarian"], suitableGoals: ["maintain", "gain"], description: "Approximate nutrition for rice, lentils and vegetables." },
  { name: "Steamed Rice", category: "Grains", servingSize: 1, calories: 205, protein: 4, carbs: 45, fats: 0, dietaryTags: ["vegetarian"], suitableGoals: ["maintain", "gain"], description: "Approximate nutrition per cooked bowl." },
  { name: "Lentil Dal", category: "Protein", servingSize: 1, calories: 180, protein: 12, carbs: 28, fats: 3, fiber: 8, dietaryTags: ["vegetarian"], suitableGoals: ["lose", "maintain", "gain"] },
  { name: "Roti", category: "Grains", servingSize: 1, calories: 120, protein: 4, carbs: 22, fats: 3, dietaryTags: ["vegetarian"], suitableGoals: ["maintain", "gain"] },
  { name: "Saag", category: "Vegetables", servingSize: 1, calories: 80, protein: 4, carbs: 10, fats: 3, fiber: 5, dietaryTags: ["vegetarian"], suitableGoals: ["lose", "maintain"] },
  { name: "Boiled Eggs", category: "Breakfast", servingSize: 2, calories: 156, protein: 13, carbs: 1, fats: 11, suitableGoals: ["lose", "maintain", "gain"], allergens: ["egg"] },
  { name: "Chicken Tarkari", category: "Dinner", servingSize: 1, calories: 320, protein: 34, carbs: 8, fats: 17, suitableGoals: ["lose", "maintain", "gain"] },
  { name: "Curd", category: "Dairy", servingSize: 1, calories: 120, protein: 7, carbs: 10, fats: 5, dietaryTags: ["vegetarian"], allergens: ["milk"] },
  { name: "Chiura with Curd", category: "Snacks", servingSize: 1, calories: 310, protein: 9, carbs: 58, fats: 5, dietaryTags: ["vegetarian"], suitableGoals: ["maintain", "gain"] },
  { name: "Oats Porridge", category: "Breakfast", servingSize: 1, calories: 250, protein: 9, carbs: 42, fats: 6, fiber: 6, dietaryTags: ["vegetarian"], suitableGoals: ["lose", "maintain"] },
];

const workouts = [
  { name: "Brisk Walking", category: "Cardio", duration: 30, caloriesBurned: 150, difficulty: "Beginner", goalTags: ["lose", "maintain"], equipment: "None", muscleGroups: ["legs"], instructions: ["Warm up for 5 minutes", "Walk at a steady pace", "Cool down slowly"] },
  { name: "Bodyweight Circuit", category: "HIIT", duration: 25, caloriesBurned: 220, difficulty: "Beginner", goalTags: ["lose", "maintain"], equipment: "None", sets: 3, reps: "12 each", restSeconds: 60, muscleGroups: ["full body"] },
  { name: "Yoga Mobility Flow", category: "Yoga", duration: 35, caloriesBurned: 110, difficulty: "Beginner", goalTags: ["maintain"], equipment: "Mat", muscleGroups: ["full body"] },
  { name: "Dumbbell Strength", category: "Strength", duration: 45, caloriesBurned: 280, difficulty: "Intermediate", goalTags: ["maintain", "gain"], equipment: "Dumbbells", sets: 4, reps: "8-12", restSeconds: 90, muscleGroups: ["chest", "back", "legs"] },
  { name: "Treadmill Intervals", category: "Cardio", duration: 30, caloriesBurned: 320, difficulty: "Intermediate", goalTags: ["lose"], equipment: "Treadmill", sets: 8, reps: "1 min hard / 1 min easy", restSeconds: 60 },
  { name: "Barbell Compound Lifts", category: "Strength", duration: 60, caloriesBurned: 420, difficulty: "Advanced", goalTags: ["gain"], equipment: "Barbell", sets: 5, reps: "5", restSeconds: 120, muscleGroups: ["full body"] },
];

export const runSeed = async () => {
  requireEnv();
  if (mongoose.connection.readyState === 0) {
    await initializeDatabase();
  }

  for (const food of foods) {
    await Food.updateOne({ name: food.name }, { $set: { ...food, isApproved: true, isActive: true } }, { upsert: true });
  }

  for (const workout of workouts) {
    await Workout.updateOne({ name: workout.name }, { $set: { ...workout, isApproved: true, isActive: true } }, { upsert: true });
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    await UserCollection.updateOne(
      { email: process.env.SEED_ADMIN_EMAIL },
      {
        $setOnInsert: {
          firstName: "Development",
          lastName: "Admin",
          username: "devadmin",
          email: process.env.SEED_ADMIN_EMAIL,
          password,
          role: "admin",
        },
      },
      { upsert: true }
    );
  }

  console.log("Seed data completed. Nutrition values are approximate sample data.");
};

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
