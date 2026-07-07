import { HealthProfileRepository } from "../repositories/healthProfile.repository";
import { IHealthProfile } from "../models/healthProfile.model";
import mongoose from "mongoose";

export class HealthProfileService {
  private repo: HealthProfileRepository;

  constructor() {
    this.repo = new HealthProfileRepository();
  }

  // Calculate BMI
  calculateBMI(weight: number, height: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }

  // Get BMI Category
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal Weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  calculateBMR(weight: number, height: number, age: number, gender: string): number {
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    
    if (gender.toLowerCase() === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    return Math.round(bmr);
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  calculateTDEE(bmr: number, activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"): number {
    const multipliers: { [key: string]: number } = {
      "sedentary": 1.2,
      "light": 1.375,
      "moderate": 1.55,
      "active": 1.725,
      "very_active": 1.9,
    };

    const multiplier = multipliers[activityLevel] || 1.55;
    return Math.round(bmr * multiplier);
  }

  // Calculate Daily Calorie Target based on goal
  calculateCalorieTarget(tdee: number, goal: "lose" | "maintain" | "gain"): number {
    switch (goal) {
      case "lose":
        return tdee - 500; // 0.5 kg per week deficit
      case "gain":
        return tdee + 400; // Lean bulk
      case "maintain":
      default:
        return tdee;
    }
  }

  // Calculate Macronutrient Distribution
  calculateMacros(calorieTarget: number, weight: number, goal: "lose" | "maintain" | "gain"): {
    protein: number;
    carbs: number;
    fats: number;
  } {
    let proteinPercent: number;
    let carbsPercent: number;
    let fatsPercent: number;

    switch (goal) {
      case "lose":
        // High protein to preserve muscle
        proteinPercent = 0.40;
        carbsPercent = 0.30;
        fatsPercent = 0.30;
        break;
      case "gain":
        // High carbs for energy, adequate protein
        proteinPercent = 0.30;
        carbsPercent = 0.45;
        fatsPercent = 0.25;
        break;
      case "maintain":
      default:
        // Balanced macros
        proteinPercent = 0.30;
        carbsPercent = 0.40;
        fatsPercent = 0.30;
    }

    // Calculate grams (1g protein = 4 cal, 1g carbs = 4 cal, 1g fat = 9 cal)
    const protein = Math.round((calorieTarget * proteinPercent) / 4);
    const carbs = Math.round((calorieTarget * carbsPercent) / 4);
    const fats = Math.round((calorieTarget * fatsPercent) / 9);

    return { protein, carbs, fats };
  }

  // Complete calculation for health profile
  async calculateAndUpdateProfile(userId: string, profileData: {
    weight: number;
    height: number;
    age: number;
    gender: "male" | "female";
    activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
    goal: "lose" | "maintain" | "gain";
  }): Promise<IHealthProfile> {
    const { weight, height, age, gender, activityLevel, goal } = profileData;

    // Calculate all metrics
    const bmi = this.calculateBMI(weight, height);
    const bmr = this.calculateBMR(weight, height, age, gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const targetCalories = this.calculateCalorieTarget(tdee, goal);
    const macros = this.calculateMacros(targetCalories, weight, goal);

    // Create profile object - convert userId to ObjectId
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
      macros: {
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats,
      },
    };

    // Use repository's createOrUpdate method
    return await this.repo.createOrUpdate(profile);
  }

  async getProfile(userId: string) {
    return await this.repo.getByUserId(userId);
  }
}