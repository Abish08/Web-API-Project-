import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("invalid ObjectId returns a clean 400 on owned log delete", async () => {
  const user = await createUser("bad-id-user");
  const response = await request(app).delete("/api/v1/food-logs/not-an-id").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 400);
});
