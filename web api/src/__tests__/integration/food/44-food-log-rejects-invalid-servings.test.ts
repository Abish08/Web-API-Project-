import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("food log rejects invalid servings", async () => {
  const user = await createUser("bad-servings");
  const food = await createFood();
  const response = await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`).send({ foodId: food._id, servings: 0, mealType: "Lunch" });
  assert.equal(response.status, 400);
});
