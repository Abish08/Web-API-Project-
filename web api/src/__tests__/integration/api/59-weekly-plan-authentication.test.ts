import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../setup";
import request from "supertest";

test("weekly-plan-requires-authentication", async () => {
  const response = await request(app).get("/api/v1/recommendations/weekly-plan");
  assert.equal(response.status, 401);
});

