import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("25-target-gain-round", () => {
  assert.equal(calculateTargetCalories(1999, "gain"), 2399);
});

