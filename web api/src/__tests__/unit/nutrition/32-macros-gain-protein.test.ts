import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("32-macros-gain-protein", () => {
  assert.equal(calculateMacros(2000, "gain").protein, 150);
});

