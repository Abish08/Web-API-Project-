import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("missing health profile returns typed 404 for recommendations", async () => {
  const user = await createUser("missing-profile");
  const response = await request(app).get("/api/v1/recommendations/diet").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 404);
});
