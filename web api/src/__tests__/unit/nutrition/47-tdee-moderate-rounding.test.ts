import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("47-tdee-moderate-rounding", () => {
  assert.equal(calculateTDEE(1814, "moderate"), 2812);
});

