import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("39-macros-round-fats", () => {
  assert.equal(calculateMacros(1234, "gain").fats, 34);
});

