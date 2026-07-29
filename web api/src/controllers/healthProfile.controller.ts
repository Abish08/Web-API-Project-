import { Request, Response } from "express";
import { HealthProfileService } from "../services/healthProfile.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { z } from "zod";

const healthProfileService = new HealthProfileService();

const healthProfileSchema = z.object({
  weight: z.coerce.number().min(20).max(300),
  height: z.coerce.number().min(80).max(250),
  age: z.coerce.number().int().min(10).max(120),
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

export class HealthProfileController {
  async createOrUpdateProfile(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const validation = healthProfileSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(validation.error),
        });
      }

      // Calculate and update profile
      const profile = await healthProfileService.calculateAndUpdateProfile(userId, validation.data);

      res.status(200).json({ 
        success: true, 
        message: "Health profile calculated and updated successfully",
        data: profile 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const profile = await healthProfileService.getProfile(userId);

      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          message: "Health profile not found" 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: profile 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}
