import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("23-target-lose-floor", () => {
  assert.equal(calculateTargetCalories(1400, "lose"), 1200);
});

