"use client";

import { useState } from "react";

interface HealthProfileData {
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
}

interface HealthProfileFormProps {
  onSubmit: (data: HealthProfileData) => Promise<{ success: boolean; message?: string }>;
  initialData?: HealthProfileData | null;
}

export default function HealthProfileForm({ onSubmit, initialData }: HealthProfileFormProps) {
  const [formData, setFormData] = useState<HealthProfileData>({
    weight: initialData?.weight ?? 70,
    height: initialData?.height ?? 170,
    age: initialData?.age ?? 25,
    gender: initialData?.gender ?? "male",
    activityLevel: initialData?.activityLevel ?? "moderate",
    goal: initialData?.goal ?? "maintain",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await onSubmit(formData);
      if (response.success) {
        alert("Health profile saved successfully!");
        window.location.reload();
      } else {
        setError(response.message || "Failed to save profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Health Profile</h2>
          <p className="text-gray-600">Enter your health information to get personalized recommendations</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight || ""}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="70"
                required
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Height (cm) *
              </label>
              <input
                type="number"
                value={formData.height || ""}
                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="175"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="25"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Activity Level */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity Level *
              </label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="light">Light (Exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="active">Active (Exercise 6-7 days/week)</option>
                <option value="very_active">Very Active (Hard exercise daily)</option>
              </select>
            </div>

            {/* Goal */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fitness Goal *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.goal === "lose" ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-300"
                }`}>
                  <input
                    type="radio"
                    value="lose"
                    checked={formData.goal === "lose"}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">📉</div>
                    <div className="font-semibold text-gray-800">Lose Weight</div>
                    <div className="text-xs text-gray-600">Burn calories</div>
                  </div>
                </label>

                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.goal === "maintain" ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-300"
                }`}>
                  <input
                    type="radio"
                    value="maintain"
                    checked={formData.goal === "maintain"}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚖️</div>
                    <div className="font-semibold text-gray-800">Maintain</div>
                    <div className="text-xs text-gray-600">Stay balanced</div>
                  </div>
                </label>

                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.goal === "gain" ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-300"
                }`}>
                  <input
                    type="radio"
                    value="gain"
                    checked={formData.goal === "gain"}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">📈</div>
                    <div className="font-semibold text-gray-800">Gain Weight</div>
                    <div className="text-xs text-gray-600">Build muscle</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Profile...
              </span>
            ) : (
              "Save Health Profile & Get Recommendations"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}