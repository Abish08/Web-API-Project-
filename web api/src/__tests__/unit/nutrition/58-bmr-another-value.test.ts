import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("58-bmr-another-value", () => {
  assert.equal(calculateBMR(90, 190, 30, "male"), 1943);
});
