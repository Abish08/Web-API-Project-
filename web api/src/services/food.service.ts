import { FoodRepository } from "../repositories/food.repository";
import { IFood } from "../models/food.model";

export class FoodService {
  private repo: FoodRepository;

  constructor() {
    this.repo = new FoodRepository();
  }

  async createFood(foodData: Partial<IFood>): Promise<IFood> {
    // Validate nutritional values
    if (foodData.calories! < 0 || foodData.protein! < 0 || foodData.carbs! < 0 || foodData.fats! < 0) {
      throw new Error("Nutritional values cannot be negative");
    }

    return await this.repo.create(foodData);
  }

  async getAllFoods(
    page: number,
    limit: number,
    search?: string,
    category?: string
  ) {
    return await this.repo.findAll(page, limit, search, category);
  }

  async getFoodById(id: string): Promise<IFood | null> {
    const food = await this.repo.findById(id);
    if (!food) {
      throw new Error("Food not found");
    }
    return food;
  }

  async updateFood(id: string, updateData: Partial<IFood>): Promise<IFood> {
    const food = await this.repo.update(id, updateData);
    if (!food) {
      throw new Error("Food not found or update failed");
    }
    return food;
  }

  async deleteFood(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new Error("Food not found or delete failed");
    }
  }

  async getFoodsByCategory(category: string): Promise<IFood[]> {
    return await this.repo.findByCategory(category);
  }

  async searchFoods(query: string): Promise<IFood[]> {
    return await this.repo.searchFoods(query);
  }

  async getTotalFoodsCount(): Promise<number> {
    return await this.repo.getTotalCount();
  }
}