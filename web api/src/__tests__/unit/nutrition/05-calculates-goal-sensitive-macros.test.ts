import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("calculates goal-sensitive macros", () => {
  assert.deepEqual(calculateMacros(2000, "lose"), { protein: 200, carbs: 150, fats: 67 });
  assert.deepEqual(calculateMacros(2000, "gain"), { protein: 150, carbs: 225, fats: 56 });
});
