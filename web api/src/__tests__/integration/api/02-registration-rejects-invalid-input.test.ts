import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("registration rejects invalid input", async () => {
  const response = await request(app).post("/api/v1/auth/register").send({ email: "bad" });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});
