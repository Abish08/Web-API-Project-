import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("admin workout writes are protected", async () => {
  const user = await createUser("workout-user");
  const admin = await createUser("workout-admin", "admin");
  const body = { name: "Admin Workout", category: "Cardio", duration: 20, caloriesBurned: 100, difficulty: "Beginner" };
  assert.equal((await request(app).post("/api/v1/workouts").send(body)).status, 401);
  assert.equal((await request(app).post("/api/v1/workouts").set("Authorization", `Bearer ${user.token}`).send(body)).status, 403);
  assert.equal((await request(app).post("/api/v1/workouts").set("Authorization", `Bearer ${admin.token}`).send(body)).status, 201);
});
