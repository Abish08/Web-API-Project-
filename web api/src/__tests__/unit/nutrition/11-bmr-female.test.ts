import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("11-bmr-female", () => {
  assert.equal(calculateBMR(70, 175, 25, "female"), 1508);
});
