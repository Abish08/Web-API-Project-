import { Router } from "express";
import { HealthProfileController } from "../controllers/healthProfile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new HealthProfileController();

// Both routes require the user to be logged in
router.post("/", authMiddleware, (req, res) =>
  controller.saveProfile(req, res)
);
router.get("/", authMiddleware, (req, res) =>
  controller.getProfile(req, res)
);

export default router;