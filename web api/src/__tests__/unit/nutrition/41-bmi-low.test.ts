import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("41-bmi-low", () => {
  assert.equal(calculateBMI(45, 170), 15.6);
});

