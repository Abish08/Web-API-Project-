import { Request, Response } from "express";
import { HealthProfileService } from "../services/healthProfile.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const healthProfileService = new HealthProfileService();

export class HealthProfileController {
  async createOrUpdateProfile(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { weight, height, age, gender, activityLevel, goal } = req.body;

      // Validate required fields
      if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        return res.status(400).json({ 
          success: false, 
          message: "All fields are required" 
        });
      }

      // Calculate and update profile
      const profile = await healthProfileService.calculateAndUpdateProfile(userId, {
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender,
        activityLevel,
        goal,
      });

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