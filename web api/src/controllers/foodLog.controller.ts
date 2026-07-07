import { Request, Response } from "express";
import { FoodLogService } from "../services/foodLog.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const foodLogService = new FoodLogService();

export class FoodLogController {
  async createLog(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { foodId, servings, mealType, date } = req.body;

      if (!foodId || !servings || !mealType) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const logDate = date ? new Date(date) : new Date();
      const log = await foodLogService.createLog(userId, foodId, servings, mealType, logDate);
      
      res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserLogs(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : new Date();

      const logs = await foodLogService.getUserLogs(userId, date);
      const summary = await foodLogService.getDailySummary(userId, date);

      res.status(200).json({ success: true, data: logs, summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteLog(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const id: string = req.params.id as string; // ✅ Fix: Explicitly cast to string
      
      await foodLogService.deleteLog(id, userId);
      res.status(200).json({ success: true, message: "Log deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}