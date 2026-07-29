import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("36-macros-small", () => {
  assert.equal(calculateMacros(100, "gain").carbs, 11);
});

