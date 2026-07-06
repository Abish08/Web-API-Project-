import { Request, Response } from "express";
import { FoodService } from "../services/food.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const foodService = new FoodService();

export class FoodController {
  // Create new food
  async createFood(req: Request, res: Response) {
    try {
      const foodData = req.body;
      
      // Add createdBy if user is authenticated
      if ((req as AuthRequest).user) {
        foodData.createdBy = (req as AuthRequest).user!.id;
      }

      const food = await foodService.createFood(foodData);
      res.status(201).json({ success: true, data: food });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all foods (with pagination, search, filter)
  async getAllFoods(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const category = req.query.category as string;

      const result = await foodService.getAllFoods(page, limit, search, category);

      res.status(200).json({
        success: true,
        data: result.foods,
        pagination: {
          total: result.total,
          page,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get food by ID
  async getFoodById(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string; // ✅ Fix: Explicitly cast to string
      const food = await foodService.getFoodById(id);
      res.status(200).json({ success: true, data: food });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Update food
  async updateFood(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string; // ✅ Fix: Explicitly cast to string
      const updateData = req.body;
      const food = await foodService.updateFood(id, updateData);
      res.status(200).json({ success: true, data: food });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete food
  async deleteFood(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string; // ✅ Fix: Explicitly cast to string
      await foodService.deleteFood(id);
      res.status(200).json({ success: true, message: "Food deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get foods by category
  async getFoodsByCategory(req: Request, res: Response) {
    try {
      const category: string = req.params.category as string; // ✅ Fix: Explicitly cast to string
      const foods = await foodService.getFoodsByCategory(category);
      res.status(200).json({ success: true, data: foods });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Search foods
  async searchFoods(req: Request, res: Response) {
    try {
      const query: string = req.query.query as string; // ✅ Fix: Explicitly cast to string
      if (!query) {
        return res.status(400).json({ success: false, message: "Search query is required" });
      }
      const foods = await foodService.searchFoods(query);
      res.status(200).json({ success: true, data: foods });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get total foods count (for admin stats)
  async getTotalFoodsCount(req: Request, res: Response) {
    try {
      const count = await foodService.getTotalFoodsCount();
      res.status(200).json({ success: true, data: { total: count } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}