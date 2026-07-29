"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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

type ActivityLevel = HealthProfileData["activityLevel"];
type Goal = HealthProfileData["goal"];

const activityOptions: Array<{ value: ActivityLevel; label: string; helper: string }> = [
  { value: "sedentary", label: "Sedentary", helper: "Little or no exercise" },
  { value: "light", label: "Light", helper: "Exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", helper: "Exercise 3-5 days/week" },
  { value: "active", label: "Active", helper: "Exercise 6-7 days/week" },
  { value: "very_active", label: "Very Active", helper: "Hard exercise daily" },
];

const goalOptions: Array<{ value: Goal; label: string; helper: string }> = [
  { value: "lose", label: "Lose Weight", helper: "Reduce calories" },
  { value: "maintain", label: "Maintain", helper: "Stay balanced" },
  { value: "gain", label: "Gain Muscle", helper: "Build strength" },
];

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
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "nn-focus-ring h-11 w-full rounded-lg border border-green-100 bg-white px-3 text-slate-950";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <Badge variant="primary">{initialData ? "Updating profile" : "New profile"}</Badge>
        <h2 className="mt-4 text-2xl font-black text-slate-950">Build Your Blueprint</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep these values accurate so your calorie, macro, diet, and workout recommendations stay useful.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="text-lg font-black text-slate-950">Body measurements</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-950">Weight (kg) *</span>
            <input
              type="number"
              step="0.1"
              value={formData.weight || ""}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className={inputClass}
              placeholder="70"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-950">Height (cm) *</span>
            <input
              type="number"
              value={formData.height || ""}
              onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
              className={inputClass}
              placeholder="175"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-950">Age *</span>
            <input
              type="number"
              value={formData.age || ""}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className={inputClass}
              placeholder="25"
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-black text-slate-950">Personal context</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-950">Gender *</span>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" })}
              className={inputClass}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-950">Activity Level *</span>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
              className={inputClass}
            >
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label} ({option.helper})</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-black text-slate-950">Fitness goal *</legend>
        <div className="grid gap-4 md:grid-cols-3">
          {goalOptions.map((option) => (
            <label
              key={option.value}
              className={`nn-focus-ring block cursor-pointer rounded-xl border-2 p-4 transition ${
                formData.goal === option.value
                  ? "border-green-800 bg-green-50"
                  : "border-green-100 bg-white hover:border-green-700"
              }`}
            >
              <input
                type="radio"
                value={option.value}
                checked={formData.goal === option.value}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value as Goal })}
                className="sr-only"
              />
              <span className="block font-black text-slate-950">{option.label}</span>
              <span className="mt-1 block text-sm text-slate-600">{option.helper}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Card className="bg-green-50 p-5">
        <h3 className="font-black text-green-950">Profile image</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Profile image upload is handled on the profile page. This form preserves the existing health-profile payload only.
        </p>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Saving Profile..." : "Save Health Profile"}
        </Button>
      </div>
    </form>
  );
}
