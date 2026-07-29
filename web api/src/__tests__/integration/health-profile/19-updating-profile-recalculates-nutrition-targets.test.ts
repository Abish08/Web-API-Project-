import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("updating profile recalculates nutrition targets", async () => {
  const user = await createUser("profile-update");
  const first = await createHealthProfile(user.token, { weight: 70 });
  const second = await createHealthProfile(user.token, { weight: 90 });
  assert.notEqual(first.body.data.bmr, second.body.data.bmr);
});
