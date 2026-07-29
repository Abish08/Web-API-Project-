import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("45-tdee-sedentary-rounding", () => {
  assert.equal(calculateTDEE(1814, "sedentary"), 2177);
});

