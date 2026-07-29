import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("60-macros-gain-another-value", () => {
  assert.equal(calculateMacros(2450, "gain").protein, 184);
});

