import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("44-bmr-female-rounding", () => {
  assert.equal(calculateBMR(77, 182, 23, "female"), 1632);
});
