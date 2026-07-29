import { Router } from "express";
import { HealthProfileController } from "../controllers/healthProfile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new HealthProfileController();

// All routes require authentication
router.use(authMiddleware);

// ✅ Fixed: Use correct method name
router.post("/", (req, res) => controller.createOrUpdateProfile(req, res));
router.get("/", (req, res) => controller.getProfile(req, res));

export default router;