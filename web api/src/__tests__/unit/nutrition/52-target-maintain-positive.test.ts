import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("52-target-maintain-positive", () => {
  assert.equal(calculateTargetCalories(3000, "maintain"), 3000);
});

