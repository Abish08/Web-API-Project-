import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("48-tdee-active-rounding", () => {
  assert.equal(calculateTDEE(1814, "active"), 3129);
});

