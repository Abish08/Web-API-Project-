import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("food detail returns the requested record", async () => {
  const food = await createFood("Detail Food");
  const response = await request(app).get(`/api/v1/foods/${food._id}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.name, "Detail Food");
});
