import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("34-macros-gain-fats", () => {
  assert.equal(calculateMacros(2000, "gain").fats, 56);
});

