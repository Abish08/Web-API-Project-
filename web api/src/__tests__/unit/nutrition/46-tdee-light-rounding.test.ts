import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("46-tdee-light-rounding", () => {
  assert.equal(calculateTDEE(1814, "light"), 2494);
});

