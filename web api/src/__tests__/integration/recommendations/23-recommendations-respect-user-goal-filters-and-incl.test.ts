import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("recommendations respect user goal filters and include targets", async () => {
  const user = await createUser("recommend-goal");
  await createHealthProfile(user.token, { goal: "lose", activityLevel: "light" });
  await Food.create({ name: "Lose Food", category: "Lunch", servingSize: 1, calories: 120, protein: 10, carbs: 10, fats: 3, suitableGoals: ["lose"], isApproved: true, isActive: true });
  await Food.create({ name: "Gain Food", category: "Lunch", servingSize: 1, calories: 500, protein: 20, carbs: 70, fats: 10, suitableGoals: ["gain"], isApproved: true, isActive: true });
  await Workout.create({ name: "Lose Workout", category: "Cardio", duration: 20, caloriesBurned: 200, difficulty: "Beginner", goalTags: ["lose"], isApproved: true, isActive: true });
  const diet = await request(app).get("/api/v1/recommendations/diet").set("Authorization", `Bearer ${user.token}`);
  const workout = await request(app).get("/api/v1/recommendations/workouts").set("Authorization", `Bearer ${user.token}`);
  assert.equal(diet.body.data.targets.calories > 0, true);
  assert.equal(diet.body.data.meals.lunch[0].name, "Lose Food");
  assert.equal(workout.body.data.workouts[0].name, "Lose Workout");
});
