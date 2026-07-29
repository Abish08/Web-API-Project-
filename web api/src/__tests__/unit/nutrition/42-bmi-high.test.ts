import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("42-bmi-high", () => {
  assert.equal(calculateBMI(120, 170), 41.5);
});

