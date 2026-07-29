import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../setup";
import request from "supertest";

test("food-log-list-requires-authentication", async () => {
  const response = await request(app).get("/api/v1/food-logs");
  assert.equal(response.status, 401);
});

