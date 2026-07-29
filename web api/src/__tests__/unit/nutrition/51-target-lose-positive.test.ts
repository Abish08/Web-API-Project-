import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("51-target-lose-positive", () => {
  assert.equal(calculateTargetCalories(3000, "lose"), 2500);
});

