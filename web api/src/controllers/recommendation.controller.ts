import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.type";
import { RecommendationService } from "../services/recommendation.service";

const service = new RecommendationService();

export class RecommendationController {
  async diet(req: AuthenticatedRequest, res: Response) {
    const data = await service.getDietRecommendation(req.user!.id);
    return res.status(200).json({ success: true, message: "Diet recommendations generated", data });
  }

  async workouts(req: AuthenticatedRequest, res: Response) {
    const data = await service.getWorkoutRecommendation(req.user!.id);
    return res.status(200).json({ success: true, message: "Workout recommendations generated", data });
  }

  async weeklyPlan(req: AuthenticatedRequest, res: Response) {
    const data = await service.getWeeklyPlan(req.user!.id);
    return res.status(200).json({ success: true, message: "Weekly plan generated", data });
  }
}
