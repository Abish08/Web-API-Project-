import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("20-target-lose", () => {
  assert.equal(calculateTargetCalories(2200, "lose"), 1700);
});

