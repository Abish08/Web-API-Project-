import { Food, IFood } from "../models/food.model";
import mongoose from "mongoose";

export class FoodRepository {
  async create(foodData: Partial<IFood>): Promise<IFood> {
    const food = new Food(foodData);
    return await food.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string
  ): Promise<{ foods: IFood[]; total: number }> {
    const query: any = { isApproved: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [foods, total] = await Promise.all([
      Food.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName"),
      Food.countDocuments(query),
    ]);

    return { foods, total };
  }

  async findById(id: string): Promise<IFood | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Food.findById(id).populate("createdBy", "firstName lastName email");
  }

  async update(id: string, updateData: Partial<IFood>): Promise<IFood | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Food.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Food.findByIdAndDelete(id);
    return !!result;
  }

  async findByCategory(category: string): Promise<IFood[]> {
    return await Food.find({ category, isApproved: true }).sort({ name: 1 });
  }

  async searchFoods(query: string): Promise<IFood[]> {
    return await Food.find({
      $text: { $search: query },
      isApproved: true,
    })
      .limit(10)
      .sort({ name: 1 });
  }

  async getTotalCount(): Promise<number> {
    return await Food.countDocuments({ isApproved: true });
  }
}