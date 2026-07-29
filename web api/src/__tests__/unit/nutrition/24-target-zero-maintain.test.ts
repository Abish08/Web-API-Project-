import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("24-target-zero-maintain", () => {
  assert.equal(calculateTargetCalories(0, "maintain"), 0);
});

