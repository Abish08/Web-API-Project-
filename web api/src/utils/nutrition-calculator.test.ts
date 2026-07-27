import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBMI,
  calculateBMR,
  calculateMacros,
  calculateTargetCalories,
  calculateTDEE,
} from "./nutrition-calculator.util";

test("calculates BMI using kg and cm", () => {
  assert.equal(calculateBMI(70, 175), 22.9);
});

test("calculates BMR with Mifflin-St Jeor", () => {
  assert.equal(calculateBMR(70, 175, 30, "male"), 1649);
  assert.equal(calculateBMR(60, 165, 28, "female"), 1330);
});

test("calculates TDEE from activity multiplier", () => {
  assert.equal(calculateTDEE(1600, "moderate"), 2480);
});

test("adjusts calorie targets by goal", () => {
  assert.equal(calculateTargetCalories(2200, "lose"), 1700);
  assert.equal(calculateTargetCalories(2200, "maintain"), 2200);
  assert.equal(calculateTargetCalories(2200, "gain"), 2600);
});

test("calculates goal-sensitive macros", () => {
  assert.deepEqual(calculateMacros(2000, "lose"), { protein: 200, carbs: 150, fats: 67 });
  assert.deepEqual(calculateMacros(2000, "gain"), { protein: 150, carbs: 225, fats: 56 });
});
