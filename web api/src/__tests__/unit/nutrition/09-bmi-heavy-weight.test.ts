import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("09-bmi-heavy-weight", () => {
  assert.equal(calculateBMI(100, 200), 25);
});

