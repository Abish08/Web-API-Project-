import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("18-tdee-very-active", () => {
  assert.equal(calculateTDEE(1600, "very_active"), 3040);
});

