import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("invalid health profile values are rejected", async () => {
  const user = await createUser("bad-profile");
  assert.equal((await createHealthProfile(user.token, { height: -1 })).status, 400);
  assert.equal((await createHealthProfile(user.token, { weight: -1 })).status, 400);
  assert.equal((await createHealthProfile(user.token, { age: 200 })).status, 400);
  assert.equal((await createHealthProfile(user.token, { activityLevel: "flying" })).status, 400);
});
