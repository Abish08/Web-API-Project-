import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ProgressController } from "../controllers/progress.controller";

const router = Router();
const controller = new ProgressController();

// All progress routes require authentication
router.use(authMiddleware);

// Get historical data
router.get("/history/calories", (req, res) => controller.getCalorieHistory(req, res));
router.get("/history/workouts", (req, res) => controller.getWorkoutHistory(req, res));

// Get overall summary
router.get("/summary", (req, res) => controller.getSummary(req, res));

export default router;