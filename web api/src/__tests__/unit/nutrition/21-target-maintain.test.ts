import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("21-target-maintain", () => {
  assert.equal(calculateTargetCalories(2200, "maintain"), 2200);
});

