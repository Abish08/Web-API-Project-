import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("56-macros-gain-total-shape", () => {
  assert.equal(calculateMacros(3187, "gain").fats, 89);
});

