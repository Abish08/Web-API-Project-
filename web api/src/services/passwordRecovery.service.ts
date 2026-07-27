import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PasswordResetOtp } from "../models/passwordResetOtp.model";
import { UserRepositoryMongo } from "../repositories/user.repository";
import { CustomHttpException } from "../exceptions/http-exception";
import { EmailService } from "./email.service";

const OTP_TTL_MINUTES = 10;
const MIN_REQUEST_INTERVAL_MS = 60 * 1000;

export class PasswordRecoveryService {
  private userRepo = new UserRepositoryMongo();
  private emailService = new EmailService();

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByEmail(email);
    const generic = { message: "If the email exists, a reset code has been sent." };

    if (!user) {
      return generic;
    }

    const existing = await PasswordResetOtp.findOne({ userId: user._id }).select("+otpHash");
    if (
      existing?.lastRequestedAt &&
      Date.now() - existing.lastRequestedAt.getTime() < MIN_REQUEST_INTERVAL_MS
    ) {
      return generic;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await PasswordResetOtp.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        otpHash,
        expiresAt,
        verifiedAt: undefined,
        consumedAt: undefined,
        lastRequestedAt: new Date(),
        $inc: { requestCount: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await this.emailService.sendPasswordResetOtp(user.email, otp);
    return generic;
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new CustomHttpException(400, "Invalid or expired OTP");
    }

    const record = await PasswordResetOtp.findOne({ userId: user._id }).select("+otpHash");
    if (!record || record.consumedAt || record.expiresAt.getTime() < Date.now()) {
      throw new CustomHttpException(400, "Invalid or expired OTP");
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      throw new CustomHttpException(400, "Invalid or expired OTP");
    }

    record.verifiedAt = new Date();
    await record.save();
    return { message: "OTP verified successfully" };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new CustomHttpException(400, "Invalid or expired OTP");
    }

    const record = await PasswordResetOtp.findOne({ userId: user._id }).select("+otpHash");
    if (!record || record.consumedAt || record.expiresAt.getTime() < Date.now() || !record.verifiedAt) {
      throw new CustomHttpException(400, "Verify OTP before resetting password");
    }

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      throw new CustomHttpException(400, "Invalid or expired OTP");
    }

    await this.userRepo.updatePassword(user._id.toString(), newPassword);
    record.consumedAt = new Date();
    await record.save();

    return { message: "Password reset successfully" };
  }
}
