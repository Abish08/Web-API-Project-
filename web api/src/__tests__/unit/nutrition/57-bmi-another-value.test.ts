import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("57-bmi-another-value", () => {
  assert.equal(calculateBMI(90, 190), 24.9);
});

