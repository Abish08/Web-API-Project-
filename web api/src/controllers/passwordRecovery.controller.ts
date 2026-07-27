import { Request, Response } from "express";
import { z } from "zod";
import { PasswordRecoveryService } from "../services/passwordRecovery.service";

const service = new PasswordRecoveryService();

const emailSchema = z.object({ email: z.email() });
const otpSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6 digit code"),
});
const resetSchema = otpSchema.extend({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export class PasswordRecoveryController {
  async forgotPassword(req: Request, res: Response) {
    const result = emailSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(result.error) });
    }

    const data = await service.forgotPassword(result.data.email);
    return res.status(200).json({ success: true, message: data.message });
  }

  async verifyOtp(req: Request, res: Response) {
    const result = otpSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(result.error) });
    }

    const data = await service.verifyOtp(result.data.email, result.data.otp);
    return res.status(200).json({ success: true, message: data.message });
  }

  async resetPassword(req: Request, res: Response) {
    const result = resetSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: z.prettifyError(result.error) });
    }

    const data = await service.resetPassword(
      result.data.email,
      result.data.otp,
      result.data.newPassword
    );
    return res.status(200).json({ success: true, message: data.message });
  }
}
