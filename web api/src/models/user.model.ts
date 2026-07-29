import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  googleId?: string;
  role: "admin" | "user"; 
  // Changed from string to object
  profilePicture?: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
  
}

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    googleId: { type: String, unique: true, sparse: true },
    role: { 
      type: String, 
      enum: ["admin", "user"], 
      default: "user" 
    }, 
    // Changed from string to object
    profilePicture: {
      url: String,
      publicId: String,
    }
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

UserSchema.set("toObject", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const UserCollection = mongoose.model<IUserDocument>("User", UserSchema);
