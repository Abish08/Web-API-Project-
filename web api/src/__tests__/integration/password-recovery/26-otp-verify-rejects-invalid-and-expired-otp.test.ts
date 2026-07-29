import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("OTP verify rejects invalid and expired OTP", async () => {
  const user = await createUser("otp-invalid");
  await PasswordResetOtp.create({ userId: user.id, otpHash: await bcrypt.hash("111111", 10), expiresAt: new Date(Date.now() - 1000), lastRequestedAt: new Date() });
  assert.equal((await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "000000" })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "111111" })).status, 400);
});
