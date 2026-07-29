"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiUrl, API_BASE_URL } from "@/lib/api/server";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Cardio",
    duration: 30,
    caloriesBurned: 200,
    difficulty: "Beginner",
    description: "",
    equipment: "",
  });

  const fetchWorkout = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(`/api/v1/workouts/${params.id}`));
      const data = await response.json();
      
      if (data.success) {
        const workoutData = data.data;
        
        setFormData({
          name: workoutData.name || "",
          category: workoutData.category || "Cardio",
          duration: parseInt(workoutData.duration) || 30,
          caloriesBurned: parseInt(workoutData.caloriesBurned) || 200,
          difficulty: workoutData.difficulty || "Beginner",
          description: workoutData.description || "",
          equipment: workoutData.equipment || "",
        });

        if (workoutData.media) {
          // Separate images and video
          const imageMedia = workoutData.media.filter((m: { type: string }) => m.type === 'image');
          const videoMedia = workoutData.media.find((m: { type: string }) => m.type === 'video');
          
          setPreviewUrls(imageMedia.map((item: { url: string }) => `${API_BASE_URL}${item.url}`));
          if (videoMedia) {
            setVideoUrl(videoMedia.url);
          }
        }
      }
    } catch {
      toast.error("Failed to load workout");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchWorkout();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchWorkout]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      setImages([]);
      setPreviewUrls([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Append images
      images.forEach((file) => {
        formDataToSend.append("images", file);
      });
      
      // Append video URL if provided
      if (videoUrl) {
        formDataToSend.append("videoUrl", videoUrl);
      }

      const response = await fetch(apiUrl(`/api/v1/workouts/${params.id}`), {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Workout updated successfully!");
        router.push("/admin/workouts");
      } else {
        toast.error(data.message || "Failed to update workout");
      }
    } catch (error) {
      toast.error("Failed to update workout");
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading workout...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Edit Workout</h1>
          <p className="text-sm text-slate-600">Update workout information</p>
        </div>
        <Link
          href="/admin/workouts"
          className="bg-green-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-green-200"
        >
          &larr; Back to Workouts
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-950 border-b pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Workout Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-4 py-2"
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
                  <option value="Cardio">Cardio</option>
                  <option value="Strength">Strength</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Yoga">Yoga</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories Burned *</label>
                <input
                  type="number"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: parseInt(e.target.value) || 0 })}
                  className="w-full border border-green-200 rounded-lg px-4 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Equipment (optional)</label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-green-200 rounded-lg px-4 py-2"
                rows={3}
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <h3 className="text-lg font-semibold text-slate-950 border-b pb-2 mb-4">Media</h3>
            <label className="block text-sm font-medium mb-1">Video URL (YouTube/External)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full border border-green-200 rounded-lg px-4 py-2"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-slate-500 mt-1">Paste a YouTube or video link</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Workout Images</label>
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
                    {/* eslint-disable-next-line @next/next/no-img-element -- Preview URLs can be local object URLs from unsaved uploads. */}
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
              href="/admin/workouts"
              className="px-4 py-2 border border-green-200 rounded-lg hover:bg-green-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {submitLoading ? "Updating..." : "Update Workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
