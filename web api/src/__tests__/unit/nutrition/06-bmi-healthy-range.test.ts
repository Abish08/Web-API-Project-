import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("06-bmi-healthy-range", () => {
  assert.equal(calculateBMI(80, 180), 24.7);
});

