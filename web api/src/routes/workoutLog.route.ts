import { Router } from "express";
import { WorkoutLogController } from "../controllers/workoutLog.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const controller = new WorkoutLogController();

router.use(authMiddleware);

router.post("/", (req, res) => controller.createLog(req, res));
router.get("/", (req, res) => controller.getUserLogs(req, res));
router.delete("/:id", (req, res) => controller.deleteLog(req, res));

export default router;