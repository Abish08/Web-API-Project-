import mongoose from "mongoose";
import { HealthProfileRepository } from "../repositories/healthProfile.repository";
import { IHealthProfile } from "../models/healthProfile.model";

export class NutritionService {
  private repo: HealthProfileRepository;

  constructor() {
    this.repo = new HealthProfileRepository();
  }

  // --- BUSINESS LOGIC METHODS ---

  private calculateBMI(weight: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  }

  private calculateBMR(
    weight: number,
    heightCm: number,
    age: number,
    gender: "male" | "female"
  ): number {
    // Mifflin-St Jeor Equation
    if (gender === "male") {
      return 10 * weight + 6.25 * heightCm - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * heightCm - 5 * age - 161;
    }
  }

  private getActivityMultiplier(level: string): number {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return multipliers[level] || 1.2;
  }

  private calculateTargetCalories(
    bmr: number,
    activityLevel: string,
    goal: string
  ): number {
    const tdee = bmr * this.getActivityMultiplier(activityLevel);
    let target = tdee;

    if (goal === "lose") target -= 500;
    if (goal === "gain") target += 500;

    return Math.round(target);
  }

  private calculateMacros(calories: number): {
    protein: number;
    carbs: number;
    fats: number;
  } {
    // Standard balanced macro split: 30% Protein, 40% Carbs, 30% Fats
    return {
      protein: Math.round((calories * 0.3) / 4), // 4 calories per gram
      carbs: Math.round((calories * 0.4) / 4),
      fats: Math.round((calories * 0.3) / 9), // 9 calories per gram
    };
  }

  // --- MAIN SERVICE METHOD ---

  async saveHealthProfile(
    userId: string | mongoose.Types.ObjectId,
    data: {
      weight: number;
      height: number;
      age: number;
      gender: "male" | "female";
      activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
      goal: "lose" | "maintain" | "gain";
    }
  ) {
    const bmi = this.calculateBMI(data.weight, data.height);
    const bmr = this.calculateBMR(
      data.weight,
      data.height,
      data.age,
      data.gender
    );
    const tdee = Math.round(bmr * this.getActivityMultiplier(data.activityLevel));
    const targetCalories = this.calculateTargetCalories(
      bmr,
      data.activityLevel,
      data.goal
    );
    const macros = this.calculateMacros(targetCalories);

    // Ensure `userId` is a string (repo expects string)
    const userIdStr = typeof userId === "string" ? userId : userId.toString();

const profileData = {
  userId, // Pass as string - Mongoose handles conversion
  weight: data.weight,
  height: data.height,
  age: data.age,
  gender: data.gender,
  activityLevel: data.activityLevel,
  goal: data.goal,
  bmi,
  bmr,
  tdee,
  targetCalories,
  macros,
} as Partial<IHealthProfile> & { userId: string };

return await this.repo.createOrUpdate(profileData);
  }

  async getProfile(userId: string) {
    return await this.repo.getByUserId(userId);
  }
}