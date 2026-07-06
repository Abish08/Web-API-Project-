import mongoose, { Schema, Document } from "mongoose";

export interface IHealthProfile extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

const healthProfileSchema = new Schema<IHealthProfile>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { 
      type: String, 
      enum: ["male", "female"], 
      required: true 
    },
    activityLevel: { 
      type: String, 
      enum: ["sedentary", "light", "moderate", "active", "very_active"], 
      required: true 
    },
    goal: { 
      type: String, 
      enum: ["lose", "maintain", "gain"], 
      required: true 
    },
    bmi: { type: Number, required: true },
    bmr: { type: Number, required: true },
    tdee: { type: Number, required: true },
    targetCalories: { type: Number, required: true },
    macros: {
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fats: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const HealthProfile = mongoose.model<IHealthProfile>(
  "HealthProfile", 
  healthProfileSchema
);