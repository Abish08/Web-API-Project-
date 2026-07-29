import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AIController } from "../controllers/ai.controller";
const router = Router();
const controller = new AIController();
router.use(authMiddleware);
router.post("/chat", (req, res) => controller.chat(req, res));
export default router;
