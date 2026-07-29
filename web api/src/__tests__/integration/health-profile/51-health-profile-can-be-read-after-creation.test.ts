import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("health profile can be read after creation", async () => {
  const user = await createUser("profile-read");
  await createHealthProfile(user.token);
  const response = await request(app).get("/api/v1/health-profile").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.weight, 70);
});
