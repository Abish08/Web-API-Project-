import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("food log accepts all supported meal types", async () => {
  const user = await createUser("meal-types");
  const food = await createFood();
  for (const mealType of ["Breakfast", "Lunch", "Dinner", "Snack"]) {
    const response = await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`).send({ foodId: food._id, servings: 1, mealType });
    assert.equal(response.status, 201);
  }
});
