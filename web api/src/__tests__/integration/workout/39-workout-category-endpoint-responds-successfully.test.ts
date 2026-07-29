import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("workout category endpoint responds successfully", async () => {
  await createWorkout("Category Workout");
  const response = await request(app).get("/api/v1/workouts/category/Cardio");
  assert.equal(response.status, 200);
});
