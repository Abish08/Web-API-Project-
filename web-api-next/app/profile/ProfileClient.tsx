"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { handleLogout } from "@/lib/actions/auth-action";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthProfile as ApiHealthProfile } from "@/lib/api/types";
import { apiUrl, API_BASE_URL } from "@/lib/api/server";

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  profilePicture?: {
    url: string;
    publicId?: string;
  };
  createdAt?: string;
}

type EditHealthProfile = {
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
};

function formatLabel(value?: string) {
  if (!value) return "Unavailable";
  return value.replace(/[-_]/g, " ");
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", variant: "warning" as const };
  if (bmi < 25) return { label: "Normal", variant: "success" as const };
  if (bmi < 30) return { label: "Overweight", variant: "warning" as const };
  return { label: "Obese", variant: "danger" as const };
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

function profileImageSrc(path: string | null) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

function TargetPill({ label, value, unit, text }: { label: string; value?: number; unit?: string; text?: string }) {
  return (
    <div className="rounded-xl border border-green-100 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-green-950">
        {text ?? value ?? "—"} {unit ? <span className="text-sm font-bold text-slate-600">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function ProfileClient({
  userData,
  healthProfile,
  token,
}: {
  userData: UserData;
  healthProfile: ApiHealthProfile | null;
  token: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(
    userData?.profilePicture?.url || null
  );

  const [editData, setEditData] = useState<EditHealthProfile>({
    weight: healthProfile?.weight || 70,
    height: healthProfile?.height || 170,
    age: healthProfile?.age || 25,
    gender: healthProfile?.gender || "male",
    activityLevel: healthProfile?.activityLevel || "moderate",
    goal: healthProfile?.goal || "maintain",
  });

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    let bmr = 10 * weight + 6.25 * height - 5 * age;
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
      case "lose":
        return tdee - 500;
      case "gain":
        return tdee + 400;
      default:
        return tdee;
    }
  };

  const calculateMacros = (calories: number, goal: string) => {
    let proteinPercent = 0.3;
    let carbsPercent = 0.4;
    let fatsPercent = 0.3;

    if (goal === "lose") {
      proteinPercent = 0.4;
      carbsPercent = 0.3;
      fatsPercent = 0.3;
    } else if (goal === "gain") {
      proteinPercent = 0.3;
      carbsPercent = 0.45;
      fatsPercent = 0.25;
    }

    return {
      protein: Math.round((calories * proteinPercent) / 4),
      carbs: Math.round((calories * carbsPercent) / 4),
      fats: Math.round((calories * fatsPercent) / 9),
    };
  };

  const liveBMI = calculateBMI(editData.weight, editData.height);
  const liveBMR = calculateBMR(editData.weight, editData.height, editData.age, editData.gender);
  const liveTDEE = calculateTDEE(liveBMR, editData.activityLevel);
  const liveTargetCalories = calculateTargetCalories(liveTDEE, editData.goal);
  const liveMacros = calculateMacros(liveTargetCalories, editData.goal);
  const currentBMI = isEditing ? liveBMI : healthProfile?.bmi;
  const bmiCategory = currentBMI ? getBMICategory(currentBMI) : null;
  const bmiMarker = currentBMI ? Math.min(Math.max(((currentBMI - 15) / 20) * 100, 0), 100) : 0;
  const imageSrc = profileImageSrc(localProfilePicture);

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

      const response = await fetch(apiUrl("/api/v1/upload/profile-picture"), {
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
      const res = await fetch(apiUrl("/api/v1/health-profile"), {
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
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-green-950 text-white shadow-md">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={`${userData.firstName} ${userData.lastName} profile picture`}
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-28 rounded-full border-4 border-white/70 object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/70 bg-green-800 text-3xl font-black">
                  {getInitials(userData.firstName, userData.lastName)}
                </div>
              )}
              <label className="nn-focus-ring absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600">
                <span className="sr-only">Upload profile picture</span>
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleProfilePictureUpload}
                  className="sr-only"
                  disabled={uploading}
                />
              </label>
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-bold">
                  Uploading
                </div>
              ) : null}
            </div>

            <div>
              <Badge className="bg-white/10 text-white" variant="primary">Personal Account</Badge>
              <h1 className="mt-4 text-3xl font-black md:text-4xl">{userData.firstName} {userData.lastName}</h1>
              <p className="mt-2 text-green-50">@{userData.username} · {userData.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Link href="/profile/edit" className="inline-flex"><Button>Edit profile</Button></Link>
            <Link href="/password" className="inline-flex"><Button variant="secondary">Change password</Button></Link>
            <form action={handleLogout}>
              <Button type="submit" variant="ghost" className="bg-white/10 text-white hover:bg-white/15 hover:text-white">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-green-500 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Health Profile</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Body metrics and goals</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {healthProfile?.updatedAt ? `Last updated ${new Date(healthProfile.updatedAt).toLocaleDateString()}` : "No health profile saved yet."}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Cancel" : "Quick edit"}</Button>
            </div>

            {!isEditing && healthProfile ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <TargetPill label="Weight" value={healthProfile.weight} unit="kg" />
                  <TargetPill label="Height" value={healthProfile.height} unit="cm" />
                  <TargetPill label="Age" value={healthProfile.age} unit="yrs" />
                </div>

                <div className="rounded-2xl bg-green-50 p-5">
                  <div className="grid gap-6 md:grid-cols-[150px_1fr] md:items-center">
                    <div className="flex aspect-square flex-col items-center justify-center rounded-full border-[12px] border-white bg-white shadow-inner">
                      <span className="text-sm font-bold text-slate-600">BMI</span>
                      <span className="text-4xl font-black text-green-950">{healthProfile.bmi.toFixed(1)}</span>
                      {bmiCategory ? <Badge variant={bmiCategory.variant}>{bmiCategory.label}</Badge> : null}
                    </div>
                    <div>
                      <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-300 via-green-500 to-red-500">
                        <span className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-white bg-green-950 shadow" style={{ left: `calc(${bmiMarker}% - 12px)` }} />
                      </div>
                      <div className="mt-3 flex justify-between text-xs font-bold text-slate-600">
                        <span>Under</span><span>Normal</span><span>Over</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TargetPill label="Activity Level" text={formatLabel(healthProfile.activityLevel)} />
                  <TargetPill label="Goal" text={formatLabel(healthProfile.goal)} />
                </div>
              </div>
            ) : isEditing ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <fieldset className="grid gap-4">
                  <legend className="sr-only">Edit health profile</legend>
                  {[
                    ["weight", "Weight (kg)", "number"],
                    ["height", "Height (cm)", "number"],
                    ["age", "Age", "number"],
                  ].map(([key, label, type]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-950">{label}</span>
                      <input
                        type={type}
                        value={editData[key as "weight" | "height" | "age"]}
                        onChange={(e) => setEditData({ ...editData, [key]: Number(e.target.value) || 0 })}
                        className="nn-focus-ring h-11 w-full rounded-lg border border-green-100 px-3"
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-950">Gender</span>
                    <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value as EditHealthProfile["gender"] })} className="nn-focus-ring h-11 w-full rounded-lg border border-green-100 px-3">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-950">Activity Level</span>
                    <select value={editData.activityLevel} onChange={(e) => setEditData({ ...editData, activityLevel: e.target.value as EditHealthProfile["activityLevel"] })} className="nn-focus-ring h-11 w-full rounded-lg border border-green-100 px-3">
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-950">Goal</span>
                    <select value={editData.goal} onChange={(e) => setEditData({ ...editData, goal: e.target.value as EditHealthProfile["goal"] })} className="nn-focus-ring h-11 w-full rounded-lg border border-green-100 px-3">
                      <option value="lose">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain">Gain Muscle</option>
                    </select>
                  </label>
                  <Button onClick={handleUpdateHealthProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </fieldset>
                <Card className="bg-green-50 p-5">
                  <h3 className="text-lg font-black text-slate-950">Live Preview</h3>
                  <p className="mt-4 text-4xl font-black text-green-950">{liveBMI.toFixed(1)}</p>
                  {bmiCategory ? <Badge variant={bmiCategory.variant}>{bmiCategory.label}</Badge> : null}
                  <div className="mt-5 grid gap-3">
                    <TargetPill label="Calories" value={liveTargetCalories} unit="kcal" />
                    <TargetPill label="Protein" value={liveMacros.protein} unit="g" />
                    <TargetPill label="Carbs" value={liveMacros.carbs} unit="g" />
                    <TargetPill label="Fat" value={liveMacros.fats} unit="g" />
                  </div>
                </Card>
              </div>
            ) : (
              <EmptyState
                className="mt-6"
                title="Create your health profile"
                description="Profile details are needed for personalized meals, workouts, calorie targets, and macro recommendations."
                action={<Button onClick={() => setIsEditing(true)}>Create Health Profile</Button>}
              />
            )}
          </Card>

          <Card className="border-t-4 border-t-green-500 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Daily Targets</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Nutrition targets</h2>
            {healthProfile ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <TargetPill label="Calories" value={healthProfile.targetCalories} unit="kcal" />
                <TargetPill label="Protein" value={healthProfile.macros.protein} unit="g" />
                <TargetPill label="Carbs" value={healthProfile.macros.carbs} unit="g" />
                <TargetPill label="Fat" value={healthProfile.macros.fats} unit="g" />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Targets will appear after you save a health profile.</p>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="border-t-4 border-t-green-500 p-6">
            <h2 className="text-xl font-black text-slate-950">Account Settings</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/profile/edit" className="nn-focus-ring rounded-lg border border-green-100 p-4 text-sm font-bold text-green-950 hover:bg-green-50">Edit health profile</Link>
              <Link href="/password" className="nn-focus-ring rounded-lg border border-green-100 p-4 text-sm font-bold text-green-950 hover:bg-green-50">Change password</Link>
              <form action={handleLogout}>
                <Button type="submit" variant="danger" className="w-full">Sign out</Button>
              </form>
            </div>
          </Card>

          <Card className="bg-none bg-green-950 p-6 text-white">
            <h2 className="text-xl font-black">Recommendation Ready</h2>
            <p className="mt-2 text-sm leading-6 text-green-50">
              Your profile powers the diet, workout, and weekly plan screens.
            </p>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
