import assert from "node:assert/strict";
import test from "node:test";
import { app, UserCollection, Food, Workout, PasswordResetOtp, runSeed, createUser, createFood, createWorkout, createHealthProfile } from "../setup";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("user can delete own food log but not another user's food log", async () => {
  const owner = await createUser("foodlog-owner");
  const other = await createUser("foodlog-other");
  const food = await createFood();
  const created = await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${owner.token}`).send({ foodId: food._id, servings: 1, mealType: "Lunch" });
  assert.equal(created.status, 201);
  assert.equal((await request(app).delete(`/api/v1/food-logs/${created.body.data._id}`).set("Authorization", `Bearer ${other.token}`)).status, 400);
  assert.equal((await request(app).delete(`/api/v1/food-logs/${created.body.data._id}`).set("Authorization", `Bearer ${owner.token}`)).status, 200);
});
