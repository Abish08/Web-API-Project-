import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = "test-jwt-secret-with-enough-length";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:3000";

const app = require("./app").default;
const { UserCollection } = require("./models/user.model");
const { Food } = require("./models/food.model");
const { Workout } = require("./models/workout.model");
const { PasswordResetOtp } = require("./models/passwordResetOtp.model");
const { runSeed } = require("./seed");

let mongo: MongoMemoryServer;

type TestUser = {
  token: string;
  id: string;
  email: string;
  password: string;
};

const userPayload = (suffix: string, role: "admin" | "user" = "user") => ({
  firstName: "Test",
  lastName: role === "admin" ? "Admin" : "User",
  email: `${suffix}@example.com`,
  username: `${suffix}_${role}`,
  password: "Password123",
  role,
});

const createUser = async (suffix: string, role: "admin" | "user" = "user"): Promise<TestUser> => {
  const payload = userPayload(suffix, role);
  const password = await bcrypt.hash(payload.password, 10);
  const user = await UserCollection.create({ ...payload, password });
  const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET!);
  return { token, id: user._id.toString(), email: user.email, password: payload.password };
};

const createFood = async (name = "Test Dal") =>
  Food.create({
    name,
    category: "Lunch",
    servingSize: 1,
    calories: 250,
    protein: 12,
    carbs: 38,
    fats: 5,
    suitableGoals: ["maintain", "lose"],
    isApproved: true,
    isActive: true,
  });

const createWorkout = async (name = "Test Walk") =>
  Workout.create({
    name,
    category: "Cardio",
    duration: 30,
    caloriesBurned: 160,
    difficulty: "Beginner",
    goalTags: ["lose", "maintain"],
    isApproved: true,
    isActive: true,
  });

const createHealthProfile = async (token: string, overrides = {}) =>
  request(app)
    .post("/api/v1/health-profile")
    .set("Authorization", `Bearer ${token}`)
    .send({
      weight: 70,
      height: 170,
      age: 25,
      gender: "male",
      activityLevel: "moderate",
      goal: "maintain",
      ...overrides,
    });

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

test("registration succeeds with valid data and hides password", async () => {
  const response = await request(app).post("/api/v1/auth/register").send(userPayload("register"));
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.password, undefined);
});

test("registration rejects invalid input", async () => {
  const response = await request(app).post("/api/v1/auth/register").send({ email: "bad" });
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("registration rejects duplicate email", async () => {
  await request(app).post("/api/v1/auth/register").send(userPayload("dupe"));
  const response = await request(app).post("/api/v1/auth/register").send({ ...userPayload("dupe"), username: "other_dupe" });
  assert.equal(response.status, 400);
});

test("login succeeds with valid credentials and hides password", async () => {
  await request(app).post("/api/v1/auth/register").send(userPayload("login"));
  const response = await request(app).post("/api/v1/auth/login").send({ email: "login@example.com", password: "Password123" });
  assert.equal(response.status, 200);
  assert.ok(response.body.data.token);
  assert.equal(response.body.data.user.password, undefined);
});

test("login fails with invalid password", async () => {
  await request(app).post("/api/v1/auth/register").send(userPayload("badlogin"));
  const response = await request(app).post("/api/v1/auth/login").send({ email: "badlogin@example.com", password: "Wrong123" });
  assert.equal(response.status, 400);
});

test("protected route without token returns 401", async () => {
  const response = await request(app).get("/api/v1/auth/whoami");
  assert.equal(response.status, 401);
});

test("invalid token returns 401", async () => {
  const response = await request(app).get("/api/v1/auth/whoami").set("Authorization", "Bearer invalid");
  assert.equal(response.status, 401);
});

test("admin stats requires authentication", async () => {
  const response = await request(app).get("/api/v1/admin/stats");
  assert.equal(response.status, 401);
});

test("normal user receives 403 for admin stats", async () => {
  const user = await createUser("stats-user");
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 403);
});

test("admin receives 200 for admin stats", async () => {
  const admin = await createUser("stats-admin", "admin");
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${admin.token}`);
  assert.equal(response.status, 200);
});

test("admin user management is protected", async () => {
  const user = await createUser("admin-users-user");
  const admin = await createUser("admin-users-admin", "admin");
  assert.equal((await request(app).get("/api/v1/admin/users")).status, 401);
  assert.equal((await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${user.token}`)).status, 403);
  assert.equal((await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${admin.token}`)).status, 200);
});

test("admin food writes are protected", async () => {
  const user = await createUser("food-user");
  const admin = await createUser("food-admin", "admin");
  const body = { name: "Admin Food", category: "Lunch", servingSize: 1, calories: 100, protein: 5, carbs: 15, fats: 2 };
  assert.equal((await request(app).post("/api/v1/foods").send(body)).status, 401);
  assert.equal((await request(app).post("/api/v1/foods").set("Authorization", `Bearer ${user.token}`).send(body)).status, 403);
  assert.equal((await request(app).post("/api/v1/foods").set("Authorization", `Bearer ${admin.token}`).send(body)).status, 201);
});

test("admin workout writes are protected", async () => {
  const user = await createUser("workout-user");
  const admin = await createUser("workout-admin", "admin");
  const body = { name: "Admin Workout", category: "Cardio", duration: 20, caloriesBurned: 100, difficulty: "Beginner" };
  assert.equal((await request(app).post("/api/v1/workouts").send(body)).status, 401);
  assert.equal((await request(app).post("/api/v1/workouts").set("Authorization", `Bearer ${user.token}`).send(body)).status, 403);
  assert.equal((await request(app).post("/api/v1/workouts").set("Authorization", `Bearer ${admin.token}`).send(body)).status, 201);
});

test("user can delete own food log but not another user's food log", async () => {
  const owner = await createUser("foodlog-owner");
  const other = await createUser("foodlog-other");
  const food = await createFood();
  const created = await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${owner.token}`).send({ foodId: food._id, servings: 1, mealType: "Lunch" });
  assert.equal(created.status, 201);
  assert.equal((await request(app).delete(`/api/v1/food-logs/${created.body.data._id}`).set("Authorization", `Bearer ${other.token}`)).status, 400);
  assert.equal((await request(app).delete(`/api/v1/food-logs/${created.body.data._id}`).set("Authorization", `Bearer ${owner.token}`)).status, 200);
});

test("user can delete own workout log but not another user's workout log", async () => {
  const owner = await createUser("workoutlog-owner");
  const other = await createUser("workoutlog-other");
  const workout = await createWorkout();
  const created = await request(app).post("/api/v1/workout-logs").set("Authorization", `Bearer ${owner.token}`).send({ workoutId: workout._id, duration: 20 });
  assert.equal(created.status, 201);
  assert.equal((await request(app).delete(`/api/v1/workout-logs/${created.body.data._id}`).set("Authorization", `Bearer ${other.token}`)).status, 400);
  assert.equal((await request(app).delete(`/api/v1/workout-logs/${created.body.data._id}`).set("Authorization", `Bearer ${owner.token}`)).status, 200);
});

test("invalid ObjectId returns a clean 400 on owned log delete", async () => {
  const user = await createUser("bad-id-user");
  const response = await request(app).delete("/api/v1/food-logs/not-an-id").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 400);
});

test("valid health profile creation succeeds and calculates values", async () => {
  const user = await createUser("profile-user");
  const response = await createHealthProfile(user.token);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.bmi > 0, true);
  assert.equal(response.body.data.targetCalories > 0, true);
});

test("invalid health profile values are rejected", async () => {
  const user = await createUser("bad-profile");
  assert.equal((await createHealthProfile(user.token, { height: -1 })).status, 400);
  assert.equal((await createHealthProfile(user.token, { weight: -1 })).status, 400);
  assert.equal((await createHealthProfile(user.token, { age: 200 })).status, 400);
  assert.equal((await createHealthProfile(user.token, { activityLevel: "flying" })).status, 400);
});

test("updating profile recalculates nutrition targets", async () => {
  const user = await createUser("profile-update");
  const first = await createHealthProfile(user.token, { weight: 70 });
  const second = await createHealthProfile(user.token, { weight: 90 });
  assert.notEqual(first.body.data.bmr, second.body.data.bmr);
});

test("missing health profile returns typed 404 for recommendations", async () => {
  const user = await createUser("missing-profile");
  const response = await request(app).get("/api/v1/recommendations/diet").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 404);
});

test("empty food database returns valid diet recommendation response", async () => {
  const user = await createUser("empty-food");
  await createHealthProfile(user.token);
  const response = await request(app).get("/api/v1/recommendations/diet").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.dailyTotals.calories, 0);
  assert.ok(response.body.data.contentWarning);
});

test("empty workout database returns valid workout recommendation response", async () => {
  const user = await createUser("empty-workout");
  await createHealthProfile(user.token);
  const response = await request(app).get("/api/v1/recommendations/workouts").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data.workouts, []);
});

test("recommendations respect user goal filters and include targets", async () => {
  const user = await createUser("recommend-goal");
  await createHealthProfile(user.token, { goal: "lose", activityLevel: "light" });
  await Food.create({ name: "Lose Food", category: "Lunch", servingSize: 1, calories: 120, protein: 10, carbs: 10, fats: 3, suitableGoals: ["lose"], isApproved: true, isActive: true });
  await Food.create({ name: "Gain Food", category: "Lunch", servingSize: 1, calories: 500, protein: 20, carbs: 70, fats: 10, suitableGoals: ["gain"], isApproved: true, isActive: true });
  await Workout.create({ name: "Lose Workout", category: "Cardio", duration: 20, caloriesBurned: 200, difficulty: "Beginner", goalTags: ["lose"], isApproved: true, isActive: true });
  const diet = await request(app).get("/api/v1/recommendations/diet").set("Authorization", `Bearer ${user.token}`);
  const workout = await request(app).get("/api/v1/recommendations/workouts").set("Authorization", `Bearer ${user.token}`);
  assert.equal(diet.body.data.targets.calories > 0, true);
  assert.equal(diet.body.data.meals.lunch[0].name, "Lose Food");
  assert.equal(workout.body.data.workouts[0].name, "Lose Workout");
});

test("weekly plan returns seven days and handles limited records", async () => {
  const user = await createUser("weekly");
  await createHealthProfile(user.token);
  await createFood("Weekly Food");
  await createWorkout("Weekly Workout");
  const response = await request(app).get("/api/v1/recommendations/weekly-plan").set("Authorization", `Bearer ${user.token}`);
  assert.equal(response.status, 200);
  assert.equal(Object.keys(response.body.data).length, 7);
});

test("forgot password response is generic and OTP is hashed", async () => {
  const user = await createUser("otp-user");
  const existing = await request(app).post("/api/v1/auth/forgot-password").send({ email: user.email });
  const missing = await request(app).post("/api/v1/auth/forgot-password").send({ email: "missing@example.com" });
  assert.equal(existing.body.message, missing.body.message);
  const record = await PasswordResetOtp.findOne({ userId: user.id }).select("+otpHash");
  assert.ok(record);
  assert.notEqual(record!.otpHash, "123456");
});

test("OTP verify rejects invalid and expired OTP", async () => {
  const user = await createUser("otp-invalid");
  await PasswordResetOtp.create({ userId: user.id, otpHash: await bcrypt.hash("111111", 10), expiresAt: new Date(Date.now() - 1000), lastRequestedAt: new Date() });
  assert.equal((await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "000000" })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "111111" })).status, 400);
});

test("OTP reset requires verification, changes password, and prevents reuse", async () => {
  const user = await createUser("otp-reset");
  await PasswordResetOtp.create({ userId: user.id, otpHash: await bcrypt.hash("222222", 10), expiresAt: new Date(Date.now() + 600000), lastRequestedAt: new Date() });
  assert.equal((await request(app).post("/api/v1/auth/reset-password").send({ email: user.email, otp: "222222", newPassword: "NewPassword123" })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "222222" })).status, 200);
  const reset = await request(app).post("/api/v1/auth/reset-password").send({ email: user.email, otp: "222222", newPassword: "NewPassword123" });
  assert.equal(reset.status, 200);
  assert.equal(reset.text.includes("222222"), false);
  assert.equal(reset.text.includes("NewPassword123"), false);
  assert.equal((await request(app).post("/api/v1/auth/reset-password").send({ email: user.email, otp: "222222", newPassword: "AnotherPass123" })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/login").send({ email: user.email, password: user.password })).status, 400);
  assert.equal((await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "NewPassword123" })).status, 200);
});

test("admin stats empty database returns zero values", async () => {
  const admin = await createUser("empty-stats", "admin");
  await UserCollection.deleteMany({ role: "user" });
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${admin.token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.totalFoods, 0);
  assert.equal(response.body.data.totalWorkouts, 0);
});

test("admin stats counts inserted records and distributions", async () => {
  const admin = await createUser("stats-counts", "admin");
  const user = await createUser("stats-member");
  await createHealthProfile(user.token, { goal: "gain", activityLevel: "active" });
  const food = await createFood("Popular Food");
  const workout = await createWorkout("Popular Workout");
  await request(app).post("/api/v1/food-logs").set("Authorization", `Bearer ${user.token}`).send({ foodId: food._id, servings: 1, mealType: "Lunch" });
  await request(app).post("/api/v1/workout-logs").set("Authorization", `Bearer ${user.token}`).send({ workoutId: workout._id, duration: 20 });
  const response = await request(app).get("/api/v1/admin/stats").set("Authorization", `Bearer ${admin.token}`);
  assert.equal(response.body.data.totalUsers, 2);
  assert.equal(response.body.data.totalFoods, 1);
  assert.equal(response.body.data.totalWorkouts, 1);
  assert.equal(response.body.data.totalFoodLogs, 1);
  assert.equal(response.body.data.totalWorkoutLogs, 1);
  assert.equal(response.body.data.usersByGoal.some((item: { _id: string; count: number }) => item._id === "gain"), true);
  assert.equal(response.body.data.usersByActivityLevel.some((item: { _id: string; count: number }) => item._id === "active"), true);
  assert.equal(response.body.data.mostLoggedFoods[0].name, "Popular Food");
  assert.equal(response.body.data.mostLoggedWorkouts[0].name, "Popular Workout");
});

test("seed script is idempotent and creates food and workout data", async () => {
  await runSeed();
  await runSeed();
  const foodCount = await Food.countDocuments();
  const workoutCount = await Workout.countDocuments();
  const distinctFoodNames = await Food.distinct("name");
  assert.equal(foodCount, distinctFoodNames.length);
  assert.equal(foodCount > 0, true);
  assert.equal(workoutCount > 0, true);
});
