import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("59-target-maintain-another-value", () => {
  assert.equal(calculateTargetCalories(2450, "maintain"), 2450);
});

