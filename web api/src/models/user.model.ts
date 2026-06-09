// Mongoose schema and model for User collection
import mongoose, { Schema, Document } from "mongoose";
import { UserDataType } from "../types/user.type";

// Interface extending UserDataType with MongoDB document properties
export interface IUserDocument extends UserDataType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB schema definition
const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Export the compiled model
export const UserCollection = mongoose.model<IUserDocument>("User", UserSchema);