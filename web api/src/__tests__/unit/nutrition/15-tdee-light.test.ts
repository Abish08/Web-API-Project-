import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("15-tdee-light", () => {
  assert.equal(calculateTDEE(1600, "light"), 2200);
});

