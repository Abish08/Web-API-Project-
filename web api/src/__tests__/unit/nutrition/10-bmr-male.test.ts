import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("10-bmr-male", () => {
  assert.equal(calculateBMR(70, 175, 25, "male"), 1674);
});
