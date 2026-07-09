"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

interface Food {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  images?: Array<{ url: string }>;
  createdAt: string;
}

export default function FoodListPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch("http://localhost:8089/api/v1/foods", {
        credentials: "include", // ✅ Send cookies for auth
      });
      const data = await response.json();
      if (data.success) {
        setFoods(data.data);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food?")) return;

    try {
      const response = await fetch(`http://localhost:8089/api/v1/foods/${id}`, {
        method: "DELETE",
        credentials: "include", // ✅ This sends cookies automatically
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Food deleted successfully!");
        fetchFoods(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to delete food");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete food");
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading foods...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Management</h1>
          <p className="text-sm text-gray-600">Manage the nutritional database for Nepali foods</p>
        </div>
        <Link
          href="/admin/foods/add"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Add New Food
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredFoods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No foods found. <Link href="/admin/foods/add" className="text-green-600 hover:underline">Add one!</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serving</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protein</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carbs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fats</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFoods.map((food) => (
                  <tr key={food._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {food.images && food.images.length > 0 ? (
                          <img
                            src={`http://localhost:8089${food.images[0].url}`}
                            alt={food.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{food.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {food.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.servingSize}g</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{food.calories} kcal</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.protein}g</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.carbs}g</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.fats}g</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/admin/foods/${food._id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(food._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}