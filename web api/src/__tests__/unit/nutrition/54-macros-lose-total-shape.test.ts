import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("54-macros-lose-total-shape", () => {
  assert.equal(calculateMacros(3187, "lose").protein, 319);
});

