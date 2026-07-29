import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("43-bmr-male-rounding", () => {
  assert.equal(calculateBMR(77, 182, 23, "male"), 1798);
});
