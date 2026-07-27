import { HealthProfileRepository } from "../repositories/healthProfile.repository";
import { IHealthProfile } from "../models/healthProfile.model";
import mongoose from "mongoose";
import {
  ActivityLevel,
  calculateBMI,
  calculateBMR,
  calculateMacros,
  calculateTargetCalories,
  calculateTDEE,
  FitnessGoal,
  Gender,
} from "../utils/nutrition-calculator.util";

export class HealthProfileService {
  private repo: HealthProfileRepository;

  constructor() {
    this.repo = new HealthProfileRepository();
  }

  calculateBMI(weight: number, height: number): number {
    return calculateBMI(weight, height);
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal Weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
    return calculateBMR(weight, height, age, gender);
  }

  calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return calculateTDEE(bmr, activityLevel);
  }

  calculateCalorieTarget(tdee: number, goal: FitnessGoal): number {
    return calculateTargetCalories(tdee, goal);
  }

  calculateMacros(calorieTarget: number, _weight: number, goal: FitnessGoal) {
    return calculateMacros(calorieTarget, goal);
  }

  async calculateAndUpdateProfile(userId: string, profileData: {
    weight: number;
    height: number;
    age: number;
    gender: Gender;
    activityLevel: ActivityLevel;
    goal: FitnessGoal;
  }): Promise<IHealthProfile> {
    const { weight, height, age, gender, activityLevel, goal } = profileData;

    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, goal);

    const profile: Partial<IHealthProfile> & { userId: string | mongoose.Types.ObjectId } = {
      userId: new mongoose.Types.ObjectId(userId),
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      bmi,
      bmr,
      tdee,
      targetCalories,
      macros,
    };

    return await this.repo.createOrUpdate(profile);
  }

  async getProfile(userId: string) {
    return await this.repo.getByUserId(userId);
  }
}
