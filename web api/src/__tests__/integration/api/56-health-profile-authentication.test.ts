import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../setup";
import request from "supertest";

test("health-profile-requires-authentication", async () => {
  const response = await request(app).get("/api/v1/health-profile");
  assert.equal(response.status, 401);
});

