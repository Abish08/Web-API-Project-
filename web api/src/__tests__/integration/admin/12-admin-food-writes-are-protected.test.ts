import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("admin food writes are protected", async () => {
  const user = await createUser("food-user");
  const admin = await createUser("food-admin", "admin");
  const body = { name: "Admin Food", category: "Lunch", servingSize: 1, calories: 100, protein: 5, carbs: 15, fats: 2 };
  assert.equal((await request(app).post("/api/v1/foods").send(body)).status, 401);
  assert.equal((await request(app).post("/api/v1/foods").set("Authorization", `Bearer ${user.token}`).send(body)).status, 403);
  assert.equal((await request(app).post("/api/v1/foods").set("Authorization", `Bearer ${admin.token}`).send(body)).status, 201);
});
