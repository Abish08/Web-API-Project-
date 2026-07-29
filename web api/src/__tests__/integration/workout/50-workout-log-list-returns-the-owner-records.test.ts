import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("workout log list returns the owner records", async () => {
  const user = await createUser("workout-log-list");
  const workout = await createWorkout();
  await request(app).post("/api/v1/workout-logs").set("Authorization", `Bearer ${user.token}`).send({ workoutId: workout._id, duration: 15 });
  const response = await request(app).get("/api/v1/workout-logs").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
});
