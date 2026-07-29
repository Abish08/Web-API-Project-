import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("12-bmr-younger-male", () => {
  assert.equal(calculateBMR(60, 160, 20, "male"), 1505);
});
