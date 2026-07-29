import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("49-tdee-very-active-rounding", () => {
  assert.equal(calculateTDEE(1814, "very_active"), 3447);
});

