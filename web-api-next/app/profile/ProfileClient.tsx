"use client";

import { useState } from "react";
import Link from "next/link";
import { handleLogout } from "@/lib/actions/auth-action";

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profilePicture?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
}

interface HealthProfile {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  updatedAt: string;
}

export default function ProfileClient({ userData, healthProfile, token }: { userData: UserData; healthProfile: any; token: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(
    userData?.profilePicture?.url || null
  );
  
  const [editData, setEditData] = useState({
    weight: healthProfile?.weight || 70,
    height: healthProfile?.height || 170,
    age: healthProfile?.age || 25,
    gender: healthProfile?.gender || "male",
    activityLevel: healthProfile?.activityLevel || "moderate",
    goal: healthProfile?.goal || "maintain",
  });

  // --- REAL-TIME CALCULATIONS ---
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === "male") bmr += 5;
    else bmr -= 161;
    return Math.round(bmr);
  };

  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const multipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
  };

  const calculateTargetCalories = (tdee: number, goal: string) => {
    switch (goal) {
      case "lose": return tdee - 500;
      case "gain": return tdee + 400;
      default: return tdee;
    }
  };

  const calculateMacros = (calories: number, weight: number, goal: string) => {
    let proteinPercent = 0.30, carbsPercent = 0.40, fatsPercent = 0.30;
    
    if (goal === "lose") {
      proteinPercent = 0.40; carbsPercent = 0.30; fatsPercent = 0.30;
    } else if (goal === "gain") {
      proteinPercent = 0.30; carbsPercent = 0.45; fatsPercent = 0.25;
    }

    return {
      protein: Math.round((calories * proteinPercent) / 4),
      carbs: Math.round((calories * carbsPercent) / 4),
      fats: Math.round((calories * fatsPercent) / 9),
    };
  };

  // Live calculations for preview
  const liveBMI = calculateBMI(editData.weight, editData.height);
  const liveBMR = calculateBMR(editData.weight, editData.height, editData.age, editData.gender);
  const liveTDEE = calculateTDEE(liveBMR, editData.activityLevel);
  const liveTargetCalories = calculateTargetCalories(liveTDEE, editData.goal);
  const liveMacros = calculateMacros(liveTargetCalories, editData.weight, editData.goal);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-100" };
    if (bmi < 25) return { label: "Normal", color: "text-green-600", bg: "bg-green-100" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Obese", color: "text-red-600", bg: "bg-red-100" };
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("http://localhost:8089/api/v1/upload/profile-picture", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setLocalProfilePicture(data.data.profilePicture.url);
        alert("Profile picture updated successfully!");
      } else {
        alert(data.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateHealthProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8089/api/v1/health-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        alert("Health profile updated successfully!");
        window.location.reload();
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const bmiCategory = isEditing ? getBMICategory(liveBMI) : (healthProfile ? getBMICategory(healthProfile.bmi) : null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
              <Link href="/log" className="text-gray-600 hover:text-green-600 text-sm font-medium">Log</Link>
              <Link href="/progress" className="text-gray-600 hover:text-green-600 text-sm font-medium">Progress</Link>
              <Link href="/profile" className="text-green-600 font-semibold text-sm border-b-2 border-green-600 pb-1">Profile</Link>
            </div>
            <div className="flex items-center gap-3">
              <form action={handleLogout}>
                <button type="submit" className="text-sm font-medium text-gray-700 hover:text-green-600">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Profile</h1>
          <p className="text-gray-500">Manage your health data and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Account Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {localProfilePicture ? (
                    <img
                      src={`http://localhost:8089${localProfilePicture}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-white text-3xl font-bold">{getInitials(userData.firstName, userData.lastName)}</span>
                    </div>
                  )}
                  
                  <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{userData.firstName} {userData.lastName}</h2>
                  <p className="text-gray-500 mb-2">@{userData.username}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {userData.email}
                  </p>
                </div>

                <Link
                  href="/password"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Password
                </Link>
              </div>
            </div>

            {/* Health Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Health Profile</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {healthProfile ? `Last updated: ${new Date(healthProfile.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : 'No data yet'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {!isEditing && healthProfile ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Weight</p>
                      <p className="text-2xl font-bold text-gray-900">{healthProfile.weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Height</p>
                      <p className="text-2xl font-bold text-gray-900">{healthProfile.height} <span className="text-sm font-normal text-gray-500">cm</span></p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Age</p>
                      <p className="text-2xl font-bold text-gray-900">{healthProfile.age} <span className="text-sm font-normal text-gray-500">yrs</span></p>
                    </div>
                  </div>

                  {/* BMI Display */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">BMI Index</p>
                        <p className="text-4xl font-bold text-gray-900">{healthProfile.bmi.toFixed(1)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${bmiCategory?.bg} ${bmiCategory?.color}`}>
                          {bmiCategory?.label}
                        </span>
                      </div>
                      <div className="flex-1 ml-8">
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div className="absolute inset-0 flex">
                            <div className="w-1/4 bg-blue-400"></div>
                            <div className="w-1/4 bg-green-500"></div>
                            <div className="w-1/4 bg-yellow-400"></div>
                            <div className="w-1/4 bg-red-500"></div>
                          </div>
                          <div 
                            className="absolute top-0 w-4 h-4 bg-gray-900 rounded-full -mt-0.5 transform -translate-x-1/2 border-2 border-white shadow-md transition-all duration-500"
                            style={{ left: `${Math.min((healthProfile.bmi / 40) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Underweight</span>
                          <span>Normal</span>
                          <span>Overweight</span>
                          <span>Obese</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Targets */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-600 text-white rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold mb-1">Daily Calories</p>
                      <p className="text-2xl font-bold">{healthProfile.targetCalories}</p>
                      <p className="text-xs text-green-100">kcal/day</p>
                    </div>
                    <div className="bg-white border-2 border-blue-500 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-gray-900">{healthProfile.macros.protein}g</p>
                    </div>
                    <div className="bg-white border-2 border-orange-500 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-gray-900">{healthProfile.macros.carbs}g</p>
                    </div>
                    <div className="bg-white border-2 border-green-500 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Fats</p>
                      <p className="text-2xl font-bold text-gray-900">{healthProfile.macros.fats}g</p>
                    </div>
                  </div>
                </>
              ) : (
                /* EDIT MODE - Interactive Form with Live Preview */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        value={editData.weight}
                        onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        value={editData.height}
                        onChange={(e) => setEditData({ ...editData, height: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        value={editData.gender}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                      <select
                        value={editData.activityLevel}
                        onChange={(e) => setEditData({ ...editData, activityLevel: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      >
                        <option value="sedentary">Sedentary (little or no exercise)</option>
                        <option value="light">Light (1-3 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                        <option value="very_active">Very Active (intense daily)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                      <select
                        value={editData.goal}
                        onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      >
                        <option value="lose">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain">Gain Muscle</option>
                      </select>
                    </div>
                    <button
                      onClick={handleUpdateHealthProfile}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>
                    
                    {/* BMI Preview */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Your BMI</p>
                      <div className="flex items-center gap-3">
                        <p className="text-4xl font-bold text-gray-900">{liveBMI.toFixed(1)}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bmiCategory?.bg} ${bmiCategory?.color}`}>
                          {bmiCategory?.label}
                        </span>
                      </div>
                    </div>

                    {/* Calorie Target Preview */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Daily Calorie Target</p>
                      <p className="text-3xl font-bold text-green-600">{liveTargetCalories}</p>
                      <p className="text-xs text-gray-500">kcal/day</p>
                    </div>

                    {/* Macro Preview */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Protein</p>
                        <p className="text-xl font-bold text-blue-600">{liveMacros.protein}g</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Carbs</p>
                        <p className="text-xl font-bold text-orange-600">{liveMacros.carbs}g</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Fats</p>
                        <p className="text-xl font-bold text-green-600">{liveMacros.fats}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && !healthProfile && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No health profile data found.</p>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Health Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <Link href="/password" className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Privacy & Security</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 px-2">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Language</span>
                  </div>
                  <span className="text-xs text-gray-500">English (US)</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <form action={handleLogout}>
                  <button type="submit" className="w-full text-red-600 hover:text-red-700 font-medium text-sm flex items-center justify-center gap-2 py-2 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}