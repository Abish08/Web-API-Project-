import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile, userPayload } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("registration rejects duplicate email", async () => {
  await request(app).post("/api/v1/auth/register").send(userPayload("dupe"));
  const response = await request(app).post("/api/v1/auth/register").send({ ...userPayload("dupe"), username: "other_dupe" });
  assert.equal(response.status, 400);
});
