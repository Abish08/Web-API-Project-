import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("user can delete own workout log but not another user's workout log", async () => {
  const owner = await createUser("workoutlog-owner");
  const other = await createUser("workoutlog-other");
  const workout = await createWorkout();
  const created = await request(app).post("/api/v1/workout-logs").set("Authorization", `Bearer ${owner.token}`).send({ workoutId: workout._id, duration: 20 });
  assert.equal(created.status, 201);
  assert.equal((await request(app).delete(`/api/v1/workout-logs/${created.body.data._id}`).set("Authorization", `Bearer ${other.token}`)).status, 400);
  assert.equal((await request(app).delete(`/api/v1/workout-logs/${created.body.data._id}`).set("Authorization", `Bearer ${owner.token}`)).status, 200);
});
