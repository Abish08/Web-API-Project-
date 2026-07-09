"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

interface Workout {
  _id: string;
  name: string;
  category: string;
  duration: number;
  caloriesBurned: number;
  difficulty: string;
  media?: Array<{ type: string; url: string }>;
  createdAt: string;
}

export default function WorkoutListPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch("http://localhost:8089/api/v1/workouts");
      const data = await response.json();
      if (data.success) {
        setWorkouts(data.data);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const response = await fetch(`http://localhost:8089/api/v1/workouts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Workout deleted successfully!");
        fetchWorkouts();
      } else {
        toast.error(data.message || "Failed to delete workout");
      }
    } catch (error) {
      toast.error("Failed to delete workout");
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading workouts...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Management</h1>
          <p className="text-sm text-gray-600">Manage the workout library</p>
        </div>
        <Link
          href="/admin/workouts/add"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Add New Workout
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No workouts found. <Link href="/admin/workouts/add" className="text-green-600 hover:underline">Add one!</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkouts.map((workout) => (
                  <tr key={workout._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {workout.media && workout.media.length > 0 ? (
                          <img
                            src={`http://localhost:8089${workout.media[0].url}`}
                            alt={workout.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{workout.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {workout.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{workout.duration} mins</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workout.caloriesBurned} kcal</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        workout.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        workout.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workout.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/admin/workouts/${workout._id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(workout._id)}
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