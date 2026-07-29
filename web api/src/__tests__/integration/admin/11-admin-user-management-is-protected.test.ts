import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("admin user management is protected", async () => {
  const user = await createUser("admin-users-user");
  const admin = await createUser("admin-users-admin", "admin");
  assert.equal((await request(app).get("/api/v1/admin/users")).status, 401);
  assert.equal((await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${user.token}`)).status, 403);
  assert.equal((await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${admin.token}`)).status, 200);
});
