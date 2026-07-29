import assert from "node:assert/strict";
import test from "node:test";
import { calculateBMI, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "../../../utils/nutrition-calculator.util";

test("37-macros-round-protein", () => {
  assert.equal(calculateMacros(1234, "lose").protein, 123);
});

