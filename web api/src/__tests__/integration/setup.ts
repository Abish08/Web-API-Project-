import assert from "node:assert/strict";
import { after, before, beforeEach } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = "test-jwt-secret-with-enough-length";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:3000";

export const app = require("../../app").default;
export const { UserCollection } = require("../../models/user.model");
export const { Food } = require("../../models/food.model");
export const { Workout } = require("../../models/workout.model");
export const { PasswordResetOtp } = require("../../models/passwordResetOtp.model");
export const { runSeed } = require("../../seed");

let mongo: MongoMemoryServer;

type TestUser = {
  token: string;
  id: string;
  email: string;
  password: string;
};

export const userPayload = (suffix: string, role: "admin" | "user" = "user") => ({
  firstName: "Test",
  lastName: role === "admin" ? "Admin" : "User",
  email: `${suffix}@example.com`,
  username: `${suffix}_${role}`,
  password: "Password123",
  role,
});

export const createUser = async (suffix: string, role: "admin" | "user" = "user"): Promise<TestUser> => {
  const payload = userPayload(suffix, role);
  const password = await bcrypt.hash(payload.password, 10);
  const user = await UserCollection.create({ ...payload, password });
  const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET!);
  return { token, id: user._id.toString(), email: user.email, password: payload.password };
};

export const createFood = async (name = "Test Dal") =>
  Food.create({
    name,
    category: "Lunch",
    servingSize: 1,
    calories: 250,
    protein: 12,
    carbs: 38,
    fats: 5,
    suitableGoals: ["maintain", "lose"],
    isApproved: true,
    isActive: true,
  });

export const createWorkout = async (name = "Test Walk") =>
  Workout.create({
    name,
    category: "Cardio",
    duration: 30,
    caloriesBurned: 160,
    difficulty: "Beginner",
    goalTags: ["lose", "maintain"],
    isApproved: true,
    isActive: true,
  });

export const createHealthProfile = async (token: string, overrides = {}) =>
  request(app)
    .post("/api/v1/health-profile")
    .set("Authorization", `Bearer ${token}`)
    .send({
      weight: 70,
      height: 170,
      age: 25,
      gender: "male",
      activityLevel: "moderate",
      goal: "maintain",
      ...overrides,
    });

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});
