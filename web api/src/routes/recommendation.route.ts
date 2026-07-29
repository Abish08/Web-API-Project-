import { Router } from "express";
import { RecommendationController } from "../controllers/recommendation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler.util";

const router = Router();
const controller = new RecommendationController();

router.use(authMiddleware);

router.get("/diet", asyncHandler((req, res) => controller.diet(req, res)));
router.get("/workouts", asyncHandler((req, res) => controller.workouts(req, res)));
router.get("/weekly-plan", asyncHandler((req, res) => controller.weeklyPlan(req, res)));

export default router;
