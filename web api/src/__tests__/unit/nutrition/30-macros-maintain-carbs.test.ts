import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("30-macros-maintain-carbs", () => {
  assert.equal(calculateMacros(2000, "maintain").carbs, 200);
});

