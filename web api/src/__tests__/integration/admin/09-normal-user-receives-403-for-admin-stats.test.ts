import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("normal user receives 403 for admin stats", async () => {
  const user = await createUser("stats-user");
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 403);
});
