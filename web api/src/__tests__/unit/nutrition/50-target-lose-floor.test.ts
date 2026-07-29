import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("50-target-lose-floor", () => {
  assert.equal(calculateTargetCalories(1600, "lose"), 1200);
});

