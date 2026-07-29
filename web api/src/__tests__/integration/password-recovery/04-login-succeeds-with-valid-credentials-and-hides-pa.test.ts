import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile, userPayload } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("login succeeds with valid credentials and hides password", async () => {
  await request(app).post("/api/v1/auth/register").send(userPayload("login"));
  const response = await request(app).post("/api/v1/auth/login").send({ email: "login@example.com", password: "Password123" });
  assert.equal(response.status, 200);
  assert.ok(response.body.data.token);
  assert.equal(response.body.data.user.password, undefined);
});
