import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("calculates BMI using kg and cm", () => {
  assert.equal(calculateBMI(70, 175), 22.9);
});
