import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("food log list returns only the owner records", async () => {
  const user = await createUser("food-log-list");
  const food = await createFood();
  await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`).send({ foodId: food._id, servings: 1, mealType: "Breakfast" });
  const response = await request(app).get("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
});
