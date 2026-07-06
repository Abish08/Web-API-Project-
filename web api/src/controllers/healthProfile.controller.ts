import { Response } from "express";
import { NutritionService } from "../services/nutrition.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const nutritionService = new NutritionService();

export class HealthProfileController {
  async saveProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { weight, height, age, gender, activityLevel, goal } = req.body;

      // Validate gender
      if (!["male", "female"].includes(gender)) {
        return res.status(400).json({
          success: false,
          message: "Gender must be 'male' or 'female'",
        });
      }

      // Validate activity level
      const validActivityLevels = [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ];
      if (!validActivityLevels.includes(activityLevel)) {
        return res.status(400).json({
          success: false,
          message: `Activity level must be one of: ${validActivityLevels.join(
            ", "
          )}`,
        });
      }

      // Validate goal
      const validGoals = ["lose", "maintain", "gain"];
      if (!validGoals.includes(goal)) {
        return res.status(400).json({
          success: false,
          message: `Goal must be one of: ${validGoals.join(", ")}`,
        });
      }

      const profile = await nutritionService.saveHealthProfile(userId, {
        weight,
        height,
        age,
        gender: gender as "male" | "female",
        activityLevel:
          activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
        goal: goal as "lose" | "maintain" | "gain",
      });

      res.status(201).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await nutritionService.getProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}