import mongoose, { Schema, Document } from "mongoose";

export interface IFoodLog extends Document {
  userId: mongoose.Types.ObjectId;
  foodId: mongoose.Types.ObjectId;
  servings: number; // Multiplier for the base food serving
  mealType: string; // Breakfast, Lunch, Dinner, Snack
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

const foodLogSchema = new Schema<IFoodLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    foodId: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    servings: { type: Number, required: true, min: 0.1, default: 1 },
    mealType: { 
      type: String, 
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"]
    },
    date: { type: Date, required: true, default: Date.now },
    totalCalories: { type: Number, required: true },
    totalProtein: { type: Number, required: true },
    totalCarbs: { type: Number, required: true },
    totalFats: { type: Number, required: true },
  },
  { timestamps: true }
);

// Index to quickly find logs by user and date
foodLogSchema.index({ userId: 1, date: 1 });

export const FoodLog = mongoose.model<IFoodLog>("FoodLog", foodLogSchema);