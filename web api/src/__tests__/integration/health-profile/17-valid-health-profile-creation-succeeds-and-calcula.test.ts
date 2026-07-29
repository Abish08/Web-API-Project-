import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("valid health profile creation succeeds and calculates values", async () => {
  const user = await createUser("profile-user");
  const response = await createHealthProfile(user.token);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.bmi > 0, true);
  assert.equal(response.body.data.targetCalories > 0, true);
});
