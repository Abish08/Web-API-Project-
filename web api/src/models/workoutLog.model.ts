import mongoose, { Schema, Document } from "mongoose";

export interface IWorkoutLog extends Document {
  userId: mongoose.Types.ObjectId;
  workoutId: mongoose.Types.ObjectId;
  duration: number; // Actual duration done by user
  caloriesBurned: number;
  date: Date;
}

const workoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: "Workout", required: true },
    duration: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

workoutLogSchema.index({ userId: 1, date: 1 });

export const WorkoutLog = mongoose.model<IWorkoutLog>("WorkoutLog", workoutLogSchema);