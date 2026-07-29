"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createWorkoutLogAction } from "./actions";
import { getWorkoutRecommendation } from "@/lib/api/recommendations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Workout, WorkoutRecommendation } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";
import { apiUrl } from "@/lib/api/server";

function formatLabel(value?: string) {
  if (!value) return "Unavailable";
  return value.replace(/[-_]/g, " ");
}

function workoutImage(workout: Workout) {
  const legacyImages = (workout as Workout & { images?: Array<{ url: string; publicId?: string }> }).images;
  const media = workout.media?.find((item) => item.type === "image") || workout.media?.[0];
  return resolveMediaUrl(media?.url || media?.thumbnail || legacyImages?.[0]?.url) || "";
}

function workoutVideoUrl(workout: Workout) {
  const legacyVideo = (workout as Workout & { videoUrl?: string; youtubeUrl?: string }).videoUrl || (workout as Workout & { youtubeUrl?: string }).youtubeUrl;
  const mediaVideo = workout.media?.find((item) => item.type === "video")?.url;
  return resolveMediaUrl(mediaVideo || legacyVideo) || "";
}

function mergeWorkouts(primary: Workout[], secondary: Workout[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((workout) => {
    if (seen.has(workout._id)) return false;
    seen.add(workout._id);
    return true;
  });
}

function uniqueValues(workouts: Workout[], field: "category" | "difficulty") {
  return Array.from(new Set(workouts.map((workout) => workout[field]).filter(Boolean)));
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="border-t-4 border-t-purple-500 p-5">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-black text-green-950">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </Card>
  );
}

function WorkoutVisual({ workout }: { workout: Workout }) {
  const imageUrl = workoutImage(workout);

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={workout.name}
        width={640}
        height={360}
        unoptimized
        className="h-44 w-full object-cover"
      />
    );
  }

  return (
    <div
      aria-label={`${workout.name} exercise placeholder image`}
      role="img"
      className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 text-center text-sm font-black text-green-950"
    >
      <span className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/55" />
      <span className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-orange-200/35" />
      <span className="relative rounded-full bg-white px-5 py-3 shadow-sm">NutriNepal Exercise</span>
    </div>
  );
}

function ExerciseInstructions({ instructions }: { instructions?: string[] }) {
  if (!instructions?.length) return null;

  return (
    <details className="group rounded-lg border border-green-100 bg-white">
      <summary className="nn-focus-ring cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-bold text-green-950">
        Technique notes
        <span aria-hidden="true" className="float-right transition group-open:rotate-180">⌄</span>
      </summary>
      <ol className="space-y-2 px-5 pb-4 text-sm leading-6 text-slate-600">
        {instructions.map((step) => (
          <li key={step} className="list-decimal">{step}</li>
        ))}
      </ol>
    </details>
  );
}

function WorkoutCard({
  workout,
  saving,
  onAdd,
  onView,
}: {
  workout: Workout;
  saving: boolean;
  onAdd: (workout: Workout) => void;
  onView: (workout: Workout) => void;
}) {
  const videoUrl = workoutVideoUrl(workout);

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,81,45,0.12)]">
      <WorkoutVisual workout={workout} />
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-xl font-black text-slate-950">{workout.name}</h2>
            <p className="mt-1 text-sm capitalize text-slate-600">{formatLabel(workout.category)}</p>
          </div>
          <Badge variant={workout.difficulty ? "primary" : "neutral"}>{formatLabel(workout.difficulty)}</Badge>
        </div>

        {workout.description ? (
          <p className="text-sm leading-6 text-slate-600">{workout.description}</p>
        ) : (
          <p className="text-sm text-slate-500">No description provided by the backend.</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">Duration</p>
            <p className="mt-1 font-black text-slate-950">{workout.duration} min</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">Sets</p>
            <p className="mt-1 font-black text-slate-950">{workout.sets ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">Reps</p>
            <p className="mt-1 font-black text-slate-950">{workout.reps || "—"}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">Rest</p>
            <p className="mt-1 font-black text-slate-950">
              {workout.restSeconds ? `${workout.restSeconds}s` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 sm:col-span-2">
            <p className="text-xs font-bold uppercase text-slate-500">Equipment</p>
            <p className="mt-1 truncate font-black text-slate-950">{workout.equipment || "None listed"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {workout.goalTags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="success">{tag}</Badge>
          ))}
          {workout.muscleGroups?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="neutral">{tag}</Badge>
          ))}
        </div>

        <ExerciseInstructions instructions={workout.instructions} />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => onView(workout)}>
            View Workout
          </Button>
          <Button disabled={saving} onClick={() => onAdd(workout)}>
            {saving ? "Adding..." : "Add to log"}
          </Button>
          {videoUrl ? (
            <a className="sm:col-span-2" href={videoUrl} target="_blank" rel="noreferrer">
              <Button className="w-full bg-purple-600 hover:bg-purple-700" type="button">
                Watch Video
              </Button>
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function WorkoutPage() {
  const [data, setData] = useState<WorkoutRecommendation | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const [result, allResponse] = await Promise.allSettled([
          getWorkoutRecommendation(),
          fetch(apiUrl("/api/v1/workouts"), { credentials: "include" }),
        ]);
        if (result.status === "fulfilled" && result.value.success) setData(result.value.data);
        if (allResponse.status === "fulfilled" && allResponse.value.ok) {
          const body = await allResponse.value.json();
          if (body.success) setAllWorkouts(body.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout recommendations");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const addToLog = async (workout: Workout) => {
    setSavingId(workout._id);
    setSaveMessage("");
    try {
      const result = await createWorkoutLogAction({ workoutId: workout._id, duration: workout.duration });
      setSaveMessage(result.success ? `${workout.name} added to your log.` : result.message || "Failed to add workout.");
    } finally {
      setSavingId("");
    }
  };

  const workouts = useMemo(() => mergeWorkouts(data?.workouts || [], allWorkouts), [allWorkouts, data]);
  const categories = useMemo(() => uniqueValues(workouts, "category"), [workouts]);
  const difficulties = uniqueValues(workouts, "difficulty");
  const filteredWorkouts = activeCategory === "all"
    ? workouts
    : workouts.filter((workout) => workout.category === activeCategory);
  const totalDuration = workouts.reduce((total, workout) => total + (workout.duration || 0), 0);
  const equipment = Array.from(new Set(workouts.map((workout) => workout.equipment).filter(Boolean)));
  const primaryFocus = categories[0] || data?.goal || "";

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <LoadingSkeleton className="h-40" />
        <div className="grid gap-4 sm:grid-cols-4">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <LoadingSkeleton className="h-96" />
          <LoadingSkeleton className="h-96" />
          <LoadingSkeleton className="h-96" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="Workout recommendations unavailable"
          description={error}
          action={
            <Link href="/profile" className="inline-flex">
              <Button>Complete health profile</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Current plan"
        title="Workout Recommendations"
        description={`Goal: ${formatLabel(data?.goal)} · Activity level: ${formatLabel(data?.activityLevel)}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/log" className="inline-flex">
              <Button>Log activity</Button>
            </Link>
            <Link href="/progress" className="inline-flex">
              <Button variant="secondary">View progress</Button>
            </Link>
          </div>
        }
      />

      {data?.contentWarning ? (
        <Card className="border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          {data.contentWarning}
        </Card>
      ) : null}

      <section className="overflow-hidden rounded-2xl bg-green-950 text-white shadow-[0_20px_50px_rgba(1,50,25,0.18)]">
        <div className="relative p-6 md:p-8">
          <span className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10" />
          <span className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-orange-400/15" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Badge className="bg-white/10 text-white" variant="primary">Mountain Strength Phase</Badge>
            <h1 className="mt-4 text-3xl font-black md:text-4xl">{formatLabel(data?.goal)} Plan</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50">
              Your recommended exercises are selected from the backend based on your saved goal and activity level.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-100">Primary Focus</p>
              <p className="mt-2 text-xl font-black capitalize">{formatLabel(primaryFocus)}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-100">Estimated Duration</p>
              <p className="mt-2 text-xl font-black">{totalDuration || "—"} min</p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Workout plan summary">
        <Metric label="Exercises" value={workouts.length} detail={allWorkouts.length ? "All approved workouts shown" : "Recommended by backend"} />
        <Metric label="Difficulty" value={difficulties[0] ? formatLabel(difficulties[0]) : "Unavailable"} detail={difficulties.length > 1 ? `${difficulties.length} levels shown` : undefined} />
        <Metric label="Estimated Calories" value={data?.estimatedCaloriesBurned ? Math.round(data.estimatedCaloriesBurned) : "Unavailable"} detail={data?.estimatedCaloriesBurned ? "Returned by recommendation" : "Not returned"} />
        <Metric label="Equipment" value={equipment.length || "None"} detail={equipment.length ? equipment.slice(0, 2).join(", ") : "No equipment listed"} />
      </section>

      {categories.length ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Workout categories">
          {["all", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`nn-focus-ring shrink-0 rounded-full px-5 py-2.5 text-sm font-black capitalize transition ${
                activeCategory === category
                  ? "bg-green-950 text-white"
                  : "border border-green-100 bg-white text-slate-600 hover:bg-green-50 hover:text-green-950"
              }`}
            >
              {formatLabel(category)}
            </button>
          ))}
        </div>
      ) : null}

      {saveMessage ? (
        <Card className="p-4 text-sm font-semibold text-green-950">{saveMessage}</Card>
      ) : null}

      {filteredWorkouts.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Recommended exercises">
          {filteredWorkouts.map((workout) => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              saving={savingId === workout._id}
              onAdd={addToLog}
              onView={setSelectedWorkout}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No suitable workouts found"
          description="The backend did not return workouts for this recommendation. Update your health profile and try again."
          action={
            <Link href="/profile/edit" className="inline-flex">
              <Button>Update profile</Button>
            </Link>
          }
        />
      )}

      {selectedWorkout ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-none bg-white p-0 shadow-2xl">
            <WorkoutVisual workout={selectedWorkout} />
            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">{formatLabel(selectedWorkout.category)}</Badge>
                    <Badge variant="warning">{formatLabel(selectedWorkout.difficulty)}</Badge>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-slate-950">{selectedWorkout.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedWorkout.description || "No description provided by the backend."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkout(null)}
                  className="nn-focus-ring rounded-full border border-green-100 px-3 py-1 text-sm font-black text-slate-600 hover:bg-green-50"
                  aria-label="Close workout details"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Duration", selectedWorkout.duration ? `${selectedWorkout.duration} min` : "-"],
                  ["Calories", selectedWorkout.caloriesBurned ? `${selectedWorkout.caloriesBurned} kcal` : "-"],
                  ["Sets", selectedWorkout.sets ?? "-"],
                  ["Reps", selectedWorkout.reps || "-"],
                  ["Rest", selectedWorkout.restSeconds ? `${selectedWorkout.restSeconds}s` : "-"],
                  ["Equipment", selectedWorkout.equipment || "None listed"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-purple-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>

              <ExerciseInstructions instructions={selectedWorkout.instructions} />

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={() => setSelectedWorkout(null)}>
                  Back to Workouts
                </Button>
                <Button onClick={() => addToLog(selectedWorkout)} disabled={savingId === selectedWorkout._id}>
                  {savingId === selectedWorkout._id ? "Adding..." : "Add to log"}
                </Button>
                {workoutVideoUrl(selectedWorkout) ? (
                  <a className="sm:col-span-2" href={workoutVideoUrl(selectedWorkout)} target="_blank" rel="noreferrer">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" type="button">
                      Watch Video
                    </Button>
                  </a>
                ) : (
                  <Button type="button" variant="secondary" disabled className="sm:col-span-2">
                    No Video
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}
