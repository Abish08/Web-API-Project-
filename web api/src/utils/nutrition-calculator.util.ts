export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type FitnessGoal = "lose" | "maintain" | "gain";

export type MacroTargets = {
  protein: number;
  carbs: number;
  fats: number;
};

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === "male" ? base + 5 : base - 161);
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number =>
  Math.round(bmr * activityMultipliers[activityLevel]);

export const calculateTargetCalories = (tdee: number, goal: FitnessGoal): number => {
  if (goal === "lose") return Math.max(1200, tdee - 500);
  if (goal === "gain") return tdee + 400;
  return tdee;
};

export const calculateMacros = (calories: number, goal: FitnessGoal): MacroTargets => {
  const ratios: Record<FitnessGoal, { protein: number; carbs: number; fats: number }> = {
    lose: { protein: 0.4, carbs: 0.3, fats: 0.3 },
    maintain: { protein: 0.3, carbs: 0.4, fats: 0.3 },
    gain: { protein: 0.3, carbs: 0.45, fats: 0.25 },
  };

  const ratio = ratios[goal];

  return {
    protein: Math.round((calories * ratio.protein) / 4),
    carbs: Math.round((calories * ratio.carbs) / 4),
    fats: Math.round((calories * ratio.fats) / 9),
  };
};
