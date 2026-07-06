import { Router } from "express";
import { FoodController } from "../controllers/food.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware"; // We'll create this

const router = Router();
const controller = new FoodController();

// Public routes (any logged-in user can view foods)
router.get("/", (req, res) => controller.getAllFoods(req, res));
router.get("/search", (req, res) => controller.searchFoods(req, res));
router.get("/category/:category", (req, res) => controller.getFoodsByCategory(req, res));
router.get("/:id", (req, res) => controller.getFoodById(req, res));

// Admin-only routes (require admin role)
router.post("/", authMiddleware, adminMiddleware, (req, res) => controller.createFood(req, res));
router.put("/:id", authMiddleware, adminMiddleware, (req, res) => controller.updateFood(req, res));
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => controller.deleteFood(req, res));

// Stats route
router.get("/stats/total", authMiddleware, adminMiddleware, (req, res) => controller.getTotalFoodsCount(req, res));

export default router;