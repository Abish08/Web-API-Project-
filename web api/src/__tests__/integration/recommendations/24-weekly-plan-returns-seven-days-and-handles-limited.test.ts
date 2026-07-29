import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("weekly plan returns seven days and handles limited records", async () => {
  const user = await createUser("weekly");
  await createHealthProfile(user.token);
  await createFood("Weekly Food");
  await createWorkout("Weekly Workout");
  const response = await request(app).get("/api/v1/recommendations/weekly-plan").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(Object.keys(response.body.data).length, 7);
});
