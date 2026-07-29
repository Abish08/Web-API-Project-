import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("workout log rejects an unknown workout", async () => {
  const user = await createUser("unknown-workout-log");
  const response = await request(app).post("/api/v1/workout-logs").set("Authorization", `Bearer ${user.token}`).send({ workoutId: new mongoose.Types.ObjectId(), duration: 20 });
  assert.notEqual(response.status, 201);
});
