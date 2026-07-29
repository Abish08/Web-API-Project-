import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("26-macros-lose-protein", () => {
  assert.equal(calculateMacros(2000, "lose").protein, 200);
});

