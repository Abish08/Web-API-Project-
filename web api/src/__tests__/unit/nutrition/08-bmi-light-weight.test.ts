import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("08-bmi-light-weight", () => {
  assert.equal(calculateBMI(50, 165), 18.4);
});

