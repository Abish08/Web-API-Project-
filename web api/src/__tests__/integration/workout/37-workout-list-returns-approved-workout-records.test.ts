import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("workout list returns approved workout records", async () => {
  await createWorkout("List Workout");
  const response = await request(app).get("/api/v1/workouts");
  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body.data), true);
});
