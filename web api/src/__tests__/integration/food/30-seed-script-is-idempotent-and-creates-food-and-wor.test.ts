import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("seed script is idempotent and creates food and workout data", async () => {
  await runSeed();
  await runSeed();
  const foodCount = await Food.countDocuments();
  const workoutCount = await Workout.countDocuments();
  const distinctFoodNames = await Food.distinct("name");
  assert.equal(foodCount, distinctFoodNames.length);
  assert.equal(foodCount > 0, true);
  assert.equal(workoutCount > 0, true);
});
