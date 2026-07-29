import { Router } from "express";
import { AdminStatsController } from "../../controllers/admin/stats.controller";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler.util";

const router = Router();
const controller = new AdminStatsController();

router.use(authMiddleware, adminMiddleware);
router.get("/", asyncHandler((req, res) => controller.getStats(req, res)));

export default router;
