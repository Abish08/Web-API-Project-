import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null }
  },
  { timestamps: true }
);

export const UserCollection = mongoose.model<IUserDocument>("User", UserSchema);