import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("07-bmi-decimal-height", () => {
  assert.equal(calculateBMI(68, 172), 23);
});

