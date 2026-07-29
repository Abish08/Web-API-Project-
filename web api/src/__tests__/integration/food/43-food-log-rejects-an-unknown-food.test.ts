import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("food log rejects an unknown food", async () => {
  const user = await createUser("unknown-food-log");
  const response = await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`).send({ foodId: new mongoose.Types.ObjectId(), servings: 1, mealType: "Lunch" });
  assert.notEqual(response.status, 201);
});
