import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("17-tdee-active", () => {
  assert.equal(calculateTDEE(1600, "active"), 2760);
});

