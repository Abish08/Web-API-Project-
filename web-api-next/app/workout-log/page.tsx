"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkoutLogsAction, createWorkoutLogAction, deleteWorkoutLogAction, searchWorkoutsAction } from "../workout/actions";
interface WorkoutLog {
  _id: string;
  workoutId: { _id: string; name: string; category: string };
  duration: number;
  caloriesBurned: number;
}

export default function WorkoutLogPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [summary, setSummary] = useState({ duration: 0, calories: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await getWorkoutLogsAction(today);
      if (result.success) {
        setLogs(result.data);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error("Failed to load workout logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const result = await searchWorkoutsAction(query);
      if (result.success) setSearchResults(result.data);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddLog = async () => {
    if (!selectedWorkout) return alert("Please select a workout");
    try {
      const result = await createWorkoutLogAction({
        workoutId: selectedWorkout._id,
        duration,
      });
      if (result.success) {
        setShowModal(false);
        setSelectedWorkout(null);
        setSearchQuery("");
        setDuration(30);
        loadLogs();
      } else {
        alert(result.message || "Failed to add log");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workout log?")) return;
    try {
      const result = await deleteWorkoutLogAction(id);
      if (result.success) loadLogs();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-bold text-gray-900">NutriNepal</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600 text-sm font-medium">Home</Link>
              <Link href="/meals" className="text-gray-600 hover:text-green-600 text-sm font-medium">Meals</Link>
              <Link href="/workout" className="text-gray-600 hover:text-green-600 text-sm font-medium">Workout</Link>
              <Link href="/log" className="text-gray-600 hover:text-green-600 text-sm font-medium">Food Log</Link>
              <Link href="/workout-log" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Workout Log</Link>
              <Link href="/progress" className="text-gray-600 hover:text-green-600 text-sm font-medium">Progress</Link>
              <Link href="/profile" className="text-gray-600 hover:text-green-600 text-sm font-medium">Profile</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-green-600">Login</Link>
              <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daily Workout Log</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            + Log Workout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.duration)} <span className="text-sm font-normal text-gray-500">mins</span></p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-xs text-gray-500 uppercase">Calories Burned</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(summary.calories)} <span className="text-sm font-normal text-gray-500">kcal</span></p>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            No workouts logged today. Click "+ Log Workout" to start tracking!
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      {log.workoutId?.category || "Workout"}
                    </span>
                    <h3 className="font-semibold text-gray-900">{log.workoutId?.name || "Unknown Workout"}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {log.duration} mins • {Math.round(log.caloriesBurned)} kcal burned
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(log._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Workout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log Workout</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Workout</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  placeholder="e.g., Morning Jog"
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((workout) => (
                      <div
                        key={workout._id}
                        onClick={() => { setSelectedWorkout(workout); setSearchQuery(workout.name); setSearchResults([]); }}
                        className={`p-2 cursor-pointer hover:bg-gray-50 ${selectedWorkout?._id === workout._id ? 'bg-green-50' : ''}`}
                      >
                        <p className="font-medium text-gray-900">{workout.name}</p>
                        <p className="text-xs text-gray-500">{workout.duration} mins • {workout.caloriesBurned} kcal</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300">Cancel</button>
                <button onClick={handleAddLog} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Save Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}