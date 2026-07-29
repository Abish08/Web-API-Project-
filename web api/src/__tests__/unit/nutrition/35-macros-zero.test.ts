import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("35-macros-zero", () => {
  assert.equal(calculateMacros(0, "maintain").protein, 0);
});

