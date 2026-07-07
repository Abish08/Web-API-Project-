import { Request, Response } from "express";
import { WorkoutLogService } from "../services/workoutLog.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const workoutLogService = new WorkoutLogService();

export class WorkoutLogController {
  async createLog(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user!.id;
      const { workoutId, duration, date } = req.body;

      if (!workoutId || !duration) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const logDate = date ? new Date(date) : new Date();
      const log = await workoutLogService.createLog(userId, workoutId, duration, logDate);
      
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

      const logs = await workoutLogService.getUserLogs(userId, date);
      const summary = await workoutLogService.getDailySummary(userId, date);

      res.status(200).json({ success: true, data: logs, summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteLog(req: Request, res: Response) {
    try {
      // ✅ Fix: Explicitly cast to string to avoid TS errors
      const id: string = req.params.id as string; 
      
      await workoutLogService.deleteLog(id);
      res.status(200).json({ success: true, message: "Log deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}