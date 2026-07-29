import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("33-macros-gain-carbs", () => {
  assert.equal(calculateMacros(2000, "gain").carbs, 225);
});

