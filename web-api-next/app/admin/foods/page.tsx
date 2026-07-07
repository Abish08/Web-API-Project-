"use client";

import { useState, useEffect } from "react";
import { fetchFoodsAction, createFoodAction, updateFoodAction, deleteFoodAction } from "./actions";
interface Food {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  description?: string;
}

export default function FoodManagementPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    category: "Lunch",
    servingSize: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    description: "",
  });

  useEffect(() => {
    loadFoods();
  }, [search, categoryFilter]);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const result = await fetchFoodsAction(search, categoryFilter);
      if (result.success) {
        setFoods(result.data);
      } else {
        console.error("Failed to fetch foods:", result.message);
      }
    } catch (error) {
      console.error("Error loading foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (food?: Food) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        category: food.category,
        servingSize: food.servingSize,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        description: food.description || "",
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: "",
        category: "Lunch",
        servingSize: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (editingFood) {
        result = await updateFoodAction(editingFood._id, formData);
      } else {
        result = await createFoodAction(formData);
      }

      if (result.success) {
        alert(editingFood ? "Food updated successfully!" : "Food created successfully!");
        setShowModal(false);
        loadFoods();
      } else {
        alert(result.message || "Failed to save food");
      }
    } catch (error) {
      console.error("Failed to save food:", error);
      alert("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food?")) return;

    try {
      const result = await deleteFoodAction(id);
      if (result.success) {
        alert("Food deleted successfully!");
        loadFoods();
      } else {
        alert(result.message || "Failed to delete food");
      }
    } catch (error) {
      console.error("Failed to delete food:", error);
      alert("An error occurred");
    }
  };

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Beverages",
    "Fruits",
    "Vegetables",
    "Grains",
    "Protein",
    "Dairy",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage the nutritional database for Nepali foods</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Add New Food
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Foods Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Serving</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Calories</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Protein</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Carbs</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fats</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Loading foods...
                  </td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No foods found. Click "Add New Food" to create one.
                  </td>
                </tr>
              ) : (
                foods.map((food) => (
                  <tr key={food._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{food.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {food.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{food.servingSize}g</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{food.calories} kcal</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{food.protein}g</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{food.carbs}g</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{food.fats}g</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(food)}
                        className="mr-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Food Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFood ? "Edit Food" : "Add New Food"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Food Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="e.g., Dal Bhat"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Serving Size (g) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Calories (kcal) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Protein (g) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Carbohydrates (g) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fats (g) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fiber (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sugar (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) => setFormData({ ...formData, sugar: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="Brief description of the food..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  {editingFood ? "Update Food" : "Add Food"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}