import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  name: string;
  category: string; // e.g., Cardio, Strength, Flexibility, Yoga
  duration: number; // in minutes
  caloriesBurned: number;
  difficulty: string; // Beginner, Intermediate, Advanced
  description?: string;
  equipment?: string;
  isApproved: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const workoutSchema = new Schema<IWorkout>(
  {
    name: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true,
      enum: ["Cardio", "Strength", "Flexibility", "Yoga", "HIIT", "Sports", "Other"]
    },
    duration: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    difficulty: { 
      type: String, 
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"]
    },
    description: { type: String, trim: true },
    equipment: { type: String, trim: true },
    isApproved: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Index for faster searches
workoutSchema.index({ name: "text", category: 1 });

export const Workout = mongoose.model<IWorkout>("Workout", workoutSchema);