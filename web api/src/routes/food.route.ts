import { Router } from "express";
import { FoodController } from "../controllers/food.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { upload } from "../middlewares/upload.middleware"; 

const router = Router();
const controller = new FoodController();

// Public routes (any logged-in user can view foods)
router.get("/", (req, res) => controller.getAllFoods(req, res));
router.get("/search", (req, res) => controller.searchFoods(req, res));
router.get("/category/:category", (req, res) => controller.getFoodsByCategory(req, res));
router.get("/:id", (req, res) => controller.getFoodById(req, res));

//  Admin-only routes with image upload support
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 5), (req, res) => 
  controller.createFoodWithImages(req, res)
);
router.put("/:id", authMiddleware, adminMiddleware, (req, res) => controller.updateFood(req, res));
router.delete("/:id", authMiddleware, adminMiddleware, (req, res) => controller.deleteFood(req, res));

// Stats route
router.get("/stats/total", authMiddleware, adminMiddleware, (req, res) => controller.getTotalFoodsCount(req, res));

export default router;