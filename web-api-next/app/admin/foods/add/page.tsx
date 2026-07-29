"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { createFoodFormAction } from "../actions";

interface RecipeData {
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

function parseNumberInput(value: string) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export default function AddFoodPage() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Lunch",
    servingSize: 100,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    description: "",
  });

  const [recipe, setRecipe] = useState<RecipeData>({
    ingredients: [""],
    instructions: [""],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: "Medium",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      formDataToSend.append("recipe", JSON.stringify(recipe));
      
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const data = await createFoodFormAction(formDataToSend);
      
      if (data.success) {
        toast.success("Food added successfully!");
        window.location.href = "/admin/foods";
      } else {
        toast.error(data.message || "Failed to add food");
      }
    } catch (error) {
      toast.error("Failed to add food");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Add New Food</h1>
          <p className="text-sm text-slate-600">Create a new food item with images and recipe</p>
        </div>
        <Link
          href="/admin/foods"
          className="bg-green-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-green-200"
        >
          &larr; Back to Foods
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-950 border-b pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Food Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-4 py-2"
                placeholder="e.g., Dal Bhat"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Serving Size (g) *</label>
                <input
                  type="number"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Calories *</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Protein (g) *</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carbs (g) *</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fats (g) *</label>
                <input
                  type="number"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recipe Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-950 border-b pb-2">Recipe Details</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  value={recipe.prepTime}
                  onChange={(e) => setRecipe({ ...recipe, prepTime: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
                <input
                  type="number"
                  value={recipe.cookTime}
                  onChange={(e) => setRecipe({ ...recipe, cookTime: parseNumberInput(e.target.value) })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={recipe.difficulty}
                  onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ingredients</label>
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => {
                      const newIngs = [...recipe.ingredients];
                      newIngs[index] = e.target.value;
                      setRecipe({ ...recipe, ingredients: newIngs });
                    }}
                    className="flex-1 border border-green-200 rounded-lg px-4 py-2"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newIngs = recipe.ingredients.filter((_, i) => i !== index);
                      setRecipe({ ...recipe, ingredients: newIngs });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg"
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ""] })}
                className="text-sm text-green-800 hover:text-green-900"
              >
                + Add Ingredient
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instructions</label>
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <span className="text-slate-500 font-medium">{index + 1}.</span>
                  <textarea
                    value={instruction}
                    onChange={(e) => {
                      const newInsts = [...recipe.instructions];
                      newInsts[index] = e.target.value;
                      setRecipe({ ...recipe, instructions: newInsts });
                    }}
                    className="flex-1 border border-green-200 rounded-lg px-4 py-2"
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newInsts = recipe.instructions.filter((_, i) => i !== index);
                      setRecipe({ ...recipe, instructions: newInsts });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg"
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setRecipe({ ...recipe, instructions: [...recipe.instructions, ""] })}
                className="text-sm text-green-800 hover:text-green-900"
              >
                + Add Step
              </button>
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Food Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-green-200 rounded-lg px-4 py-2"
            />
            
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Preview URLs are local object URLs from unsaved uploads. */}
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              href="/admin/foods"
              className="px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Adding Food..." : "Add Food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
