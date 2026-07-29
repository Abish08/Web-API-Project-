import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("forgot password response is generic and OTP is hashed", async () => {
  const user = await createUser("otp-user");
  const existing = await request(app).post("/api/v1/auth/forgot-password").send({ email: user.email });
  const missing = await request(app).post("/api/v1/auth/forgot-password").send({ email: "missing@example.com" });
  assert.equal(existing.body.message, missing.body.message);
  const record = await PasswordResetOtp.findOne({ userId: user.id }).select("+otpHash");
  assert.ok(record);
  assert.notEqual(record!.otpHash, "123456");
});
