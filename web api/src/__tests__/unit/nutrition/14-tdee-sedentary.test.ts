import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("14-tdee-sedentary", () => {
  assert.equal(calculateTDEE(1600, "sedentary"), 1920);
});

