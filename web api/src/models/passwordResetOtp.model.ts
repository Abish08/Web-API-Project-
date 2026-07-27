import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordResetOtp extends Document {
  userId: mongoose.Types.ObjectId;
  otpHash: string;
  expiresAt: Date;
  verifiedAt?: Date;
  consumedAt?: Date;
  requestCount: number;
  lastRequestedAt: Date;
}

const passwordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    verifiedAt: Date,
    consumedAt: Date,
    requestCount: { type: Number, default: 1 },
    lastRequestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetOtp = mongoose.model<IPasswordResetOtp>(
  "PasswordResetOtp",
  passwordResetOtpSchema
);
