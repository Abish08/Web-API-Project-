import { Request, Response } from "express";
import { ProgressService } from "../services/progress.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const progressService = new ProgressService();

export class ProgressController {
  async getCalorieHistory(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const days = parseInt(req.query.days as string) || 30;

      const history = await progressService.getCalorieHistory(userId, days);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getWorkoutHistory(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const days = parseInt(req.query.days as string) || 30;

      const history = await progressService.getWorkoutHistory(userId, days);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const summary = await progressService.getSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}