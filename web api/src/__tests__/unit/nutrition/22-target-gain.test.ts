import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("22-target-gain", () => {
  assert.equal(calculateTargetCalories(2200, "gain"), 2600);
});

