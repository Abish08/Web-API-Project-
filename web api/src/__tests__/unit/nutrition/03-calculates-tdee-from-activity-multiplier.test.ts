import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("calculates TDEE from activity multiplier", () => {
  assert.equal(calculateTDEE(1600, "moderate"), 2480);
});
