import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth.type";
import { AdminStatsService } from "../../services/adminStats.service";

const service = new AdminStatsService();

export class AdminStatsController {
  async getStats(req: AuthenticatedRequest, res: Response) {
    const data = await service.getStats();
    return res.status(200).json({ success: true, message: "Admin statistics retrieved", data });
  }
}
