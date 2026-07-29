import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("admin receives 200 for admin stats", async () => {
  const admin = await createUser("stats-admin", "admin");
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${admin.token}`);
  assert.equal(response.status, 200);
});
