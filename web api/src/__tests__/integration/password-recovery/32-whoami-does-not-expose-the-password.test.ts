import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("whoami does not expose the password", async () => {
  const user = await createUser("whoami-safe");
  const response = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.body.data.password, undefined);
});
