import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("admin stats counts inserted records and distributions", async () => {
  const admin = await createUser("stats-counts", "admin");
  const user = await createUser("stats-member");
  await createHealthProfile(user.token, { goal: "gain", activityLevel: "active" });
  const food = await createFood("Popular Food");
  const workout = await createWorkout("Popular Workout");
  await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`).send({ foodId: food._id, servings: 1, mealType: "Lunch" });
  await request(app).post("/api/v1/workout-logs").set("Authorization", `Bearer ${user.token}`).send({ workoutId: workout._id, duration: 20 });
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${admin.token}`);
  assert.equal(response.body.data.totalUsers, 2);
  assert.equal(response.body.data.totalFoods, 1);
  assert.equal(response.body.data.totalWorkouts, 1);
  assert.equal(response.body.data.totalFoodLogs, 1);
  assert.equal(response.body.data.totalWorkoutLogs, 1);
  assert.equal(response.body.data.usersByGoal.some((item: { _id: string; count: number }) => item._id === "gain"), true);
  assert.equal(response.body.data.usersByActivityLevel.some((item: { _id: string; count: number }) => item._id === "active"), true);
  assert.equal(response.body.data.mostLoggedFoods[0].name, "Popular Food");
  assert.equal(response.body.data.mostLoggedWorkouts[0].name, "Popular Workout");
});
