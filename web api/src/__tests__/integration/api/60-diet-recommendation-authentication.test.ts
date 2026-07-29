import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../setup";
import request from "supertest";

test("diet-recommendation-requires-authentication", async () => {
  const response = await request(app).get("/api/v1/recommendations/diet");
  assert.equal(response.status, 401);
});

