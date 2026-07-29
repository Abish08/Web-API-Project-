import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("27-macros-lose-carbs", () => {
  assert.equal(calculateMacros(2000, "lose").carbs, 150);
});

