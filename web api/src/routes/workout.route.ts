import { Router } from "express";
import { WorkoutController } from "../controllers/workout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();
const controller = new WorkoutController();

// Public routes
router.get("/", (req, res) => controller.getAllWorkouts(req, res));
router.get("/search", (req, res) => controller.searchWorkouts(req, res));
router.get("/category/:category", (req, res) => controller.getWorkoutsByCategory(req, res));
router.get("/:id", (req, res) => controller.getWorkoutById(req, res));

// Admin-only routes
router.post("/", authMiddleware, adminMiddleware, (req, res) => controller.createWorkout(req, res));
router.put("/:id", authMiddleware, adminMiddleware, (req, res) => controller.updateWorkout(req, res));
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => controller.deleteWorkout(req, res));

// Stats route
router.get("/stats/total", authMiddleware, adminMiddleware, (req, res) => controller.getTotalWorkoutsCount(req, res));

export default router;