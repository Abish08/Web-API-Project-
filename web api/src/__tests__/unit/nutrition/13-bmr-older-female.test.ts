import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("13-bmr-older-female", () => {
  assert.equal(calculateBMR(65, 165, 40, "female"), 1320);
});

