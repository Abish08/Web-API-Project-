import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("38-macros-round-carbs", () => {
  assert.equal(calculateMacros(1234, "maintain").carbs, 123);
});

