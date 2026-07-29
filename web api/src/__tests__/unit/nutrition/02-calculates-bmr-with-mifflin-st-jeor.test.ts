import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("calculates BMR with Mifflin-St Jeor", () => {
  assert.equal(calculateBMR(70, 175, 30, "male"), 1649);
  assert.equal(calculateBMR(60, 165, 28, "female"), 1330);
});
