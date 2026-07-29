import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("OTP reset requires verification, changes password, and prevents reuse", async () => {
  const user = await createUser("otp-reset");
  await PasswordResetOtp.create({ userId: user.id, otpHash: await bcrypt.hash("222222", 10), expiresAt: new Date(Date.now() + 600000), lastRequestedAt: new Date() });
  assert.equal((await request(app).post("/api/v1/auth/reset-password").send({ email: user.email, otp: "222222", newPassword: "NewPassword123" })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "222222" })).status, 200);
  const reset = await request(app).post("/api/v1/auth/reset-password").send({ email: user.email, otp: "222222", newPassword: "NewPassword123" });
  assert.equal(reset.status, 200);
  assert.equal(reset.text.includes("222222"), false);
  assert.equal(reset.text.includes("NewPassword123"), false);
  assert.equal((await request(app).post("/api/v1/auth/reset-password").send({ email: user.email, otp: "222222", newPassword: "AnotherPass123" })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/login").send({ email: user.email, password: user.password })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "NewPassword123" })).status, 200);
});
