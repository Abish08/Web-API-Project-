"use client";

import { useState, useEffect } from "react";
import { fetchWorkoutsAction, createWorkoutAction, updateWorkoutAction, deleteWorkoutAction } from "./actions";

interface Workout {
  _id: string;
  name: string;
  category: string;
  duration: number;
  caloriesBurned: number;
  difficulty: string;
  description?: string;
  equipment?: string;
}

export default function WorkoutManagementPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    category: "Cardio",
    duration: 30,
    caloriesBurned: 200,
    difficulty: "Beginner",
    description: "",
    equipment: "",
  });

  useEffect(() => {
    loadWorkouts();
  }, [search, categoryFilter]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const result = await fetchWorkoutsAction(search, categoryFilter);
      if (result.success) setWorkouts(result.data);
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (workout?: Workout) => {
    if (workout) {
      setEditingWorkout(workout);
      setFormData({
        name: workout.name,
        category: workout.category,
        duration: workout.duration,
        caloriesBurned: workout.caloriesBurned,
        difficulty: workout.difficulty,
        description: workout.description || "",
        equipment: workout.equipment || "",
      });
    } else {
      setEditingWorkout(null);
      setFormData({
        name: "",
        category: "Cardio",
        duration: 30,
        caloriesBurned: 200,
        difficulty: "Beginner",
        description: "",
        equipment: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = editingWorkout
        ? await updateWorkoutAction(editingWorkout._id, formData)
        : await createWorkoutAction(formData);

      if (result.success) {
        alert(editingWorkout ? "Workout updated!" : "Workout created!");
        setShowModal(false);
        loadWorkouts();
      } else {
        alert(result.message || "Failed to save workout");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;
    try {
      const result = await deleteWorkoutAction(id);
      if (result.success) {
        alert("Workout deleted!");
        loadWorkouts();
      } else {
        alert(result.message || "Failed to delete workout");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const categories = ["Cardio", "Strength", "Flexibility", "Yoga", "HIIT", "Sports", "Other"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workout Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage the exercise database for user routines</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Add New Workout
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="all" className="text-gray-900">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="text-gray-900">{cat}</option>
          ))}
        </select>
      </div>

      {/* Workouts Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">Calories</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">Difficulty</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading workouts...</td></tr>
              ) : workouts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No workouts found.</td></tr>
              ) : (
                workouts.map((workout) => (
                  <tr key={workout._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{workout.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                        {workout.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{workout.duration} mins</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{workout.caloriesBurned} kcal</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{workout.difficulty}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(workout)} className="mr-2 text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
                      <button onClick={() => handleDelete(workout._id)} className="text-sm font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingWorkout ? "Edit Workout" : "Add New Workout"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Workout Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="e.g., Morning Jog" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
                  <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty *</label>
                  <select required value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                    {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Duration (mins) *</label>
                  <input type="number" required min="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Calories Burned *</label>
                  <input type="number" required min="0" value={formData.caloriesBurned} onChange={(e) => setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Equipment (Optional)</label>
                <input type="text" value={formData.equipment} onChange={(e) => setFormData({ ...formData, equipment: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="e.g., Dumbbells, Mat, None" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="Brief description..." />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">{editingWorkout ? "Update Workout" : "Add Workout"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}