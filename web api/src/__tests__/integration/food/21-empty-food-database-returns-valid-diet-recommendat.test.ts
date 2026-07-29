import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("empty food database returns valid diet recommendation response", async () => {
  const user = await createUser("empty-food");
  await createHealthProfile(user.token);
  const response = await request(app).get("/api/v1/recommendations/diet").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.dailyTotals.calories, 0);
  assert.ok(response.body.data.contentWarning);
});
