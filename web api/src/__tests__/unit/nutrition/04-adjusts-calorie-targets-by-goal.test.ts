import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("adjusts calorie targets by goal", () => {
  assert.equal(calculateTargetCalories(2200, "lose"), 1700);
  assert.equal(calculateTargetCalories(2200, "maintain"), 2200);
  assert.equal(calculateTargetCalories(2200, "gain"), 2600);
});
