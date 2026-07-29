import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../setup";
import request from "supertest";

test("workout-list-is-public", async () => {
  const response = await request(app).get("/api/v1/workouts");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});
