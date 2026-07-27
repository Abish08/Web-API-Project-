"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { apiUrl } from "@/lib/api/server";
import { Food } from "@/lib/api/types";

export default function FoodListPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/v1/foods"), { credentials: "include" });
      const data = await response.json();
      if (data.success) setFoods(data.data);
    } catch {
      toast.error("Failed to fetch foods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchFoods();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchFoods]);

  const filteredFoods = useMemo(
    () => foods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [foods, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food?")) return;

    try {
      const response = await fetch(apiUrl(`/api/v1/foods/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Food deleted successfully");
        void fetchFoods();
      } else {
        toast.error(data.message || "Failed to delete food");
      }
    } catch {
      toast.error("Failed to delete food");
    }
  };

  if (loading) return <div className="py-12 text-center">Loading foods...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Management</h1>
          <p className="text-sm text-gray-600">Manage the food library</p>
        </div>
        <Link href="/admin/foods/add" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          Add Food
        </Link>
      </div>

      <input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2"
        placeholder="Search foods..."
        aria-label="Search foods"
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Category", "Serving", "Calories", "Macros", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFoods.map((food) => (
              <tr key={food._id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{food.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{food.category}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{food.servingSize}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{food.calories}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  P {food.protein}g / C {food.carbs}g / F {food.fats}g
                </td>
                <td className="space-x-3 px-4 py-3 text-sm">
                  <Link href={`/admin/foods/${food._id}/edit`} className="font-medium text-green-700">Edit</Link>
                  <button type="button" onClick={() => void handleDelete(food._id)} className="font-medium text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFoods.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No foods found.</p>}
      </div>
    </div>
  );
}
