"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTodayFoodSummaryAction, getTodayWorkoutSummaryAction } from "./actions";
import { getUserData } from "@/lib/cookies";
import { getUserHealthProfileAction } from "@/app/meals/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { FoodLog, HealthProfile, WorkoutLog } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";

type FoodSummary = { calories: number; protein: number; carbs: number; fats: number };
type WorkoutSummary = { duration: number; calories: number };

const defaultFoodSummary: FoodSummary = { calories: 0, protein: 0, carbs: 0, fats: 0 };
const defaultWorkoutSummary: WorkoutSummary = { duration: 0, calories: 0 };

function Icon({
  type,
  className = "h-5 w-5",
}: {
  type: "food" | "flame" | "chart" | "clock" | "profile";
  className?: string;
}) {
  const paths = {
    food: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    flame: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    profile: "M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z",
  };

  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[type]} />
    </svg>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatGoal(goal?: HealthProfile["goal"]) {
  if (!goal) return "Goal not set";
  return goal === "lose" ? "Weight loss" : goal === "gain" ? "Muscle gain" : "Maintain health";
}

function bmiCategory(bmi?: number) {
  if (!bmi) return "Unavailable";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function progressPercent(current: number, target?: number) {
  if (!target || target <= 0) return 0;
  return Math.min(Math.max((current / target) * 100, 0), 100);
}

function MacroBar({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target?: number;
}) {
  const percent = progressPercent(current, target);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-950">{label}</span>
        <span className="text-slate-600">
          {target ? `${Math.round(current)}g / ${Math.round(target)}g` : `${Math.round(current)}g logged`}
        </span>
      </div>
      <div
        aria-label={`${label} macro progress`}
        aria-valuemin={0}
        aria-valuemax={target || 100}
        aria-valuenow={target ? Math.round(current) : 0}
        role="progressbar"
        className="h-2.5 overflow-hidden rounded-full bg-green-50"
      >
        <div className="h-full rounded-full bg-green-800" style={{ width: `${percent}%` }} />
      </div>
      {!target ? (
        <p className="mt-2 text-xs text-slate-500">Daily target unavailable until health profile is complete.</p>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone = "green",
}: {
  title: string;
  value: string;
  detail?: string;
  icon: "food" | "flame" | "chart" | "clock";
  tone?: "green" | "orange";
}) {
  return (
    <Card className="border-t-4 border-t-blue-500 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            tone === "orange"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <Icon type={icon} />
        </span>
      </div>
    </Card>
  );
}

function FoodLogRow({ log }: { log: FoodLog }) {
  const food = typeof log.foodId === "object" ? log.foodId : null;
  const imageUrl = resolveMediaUrl(food?.images?.[0]?.url || food?.thumbnail?.url);

  return (
    <div className="flex items-center gap-3 border-b border-green-100 py-3 last:border-0">
      {imageUrl ? (
        <Image src={imageUrl} alt={food?.name || "Logged food"} width={56} height={56} unoptimized className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Icon type="food" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-950">{food?.name || "Logged food"}</p>
        <p className="text-xs capitalize text-slate-600">
          {log.mealType} · {log.servings} serving(s)
        </p>
      </div>
      <span className="text-sm font-black text-green-950">{Math.round(log.totalCalories)} kcal</span>
    </div>
  );
}

function WorkoutLogRow({ log }: { log: WorkoutLog }) {
  const workout = typeof log.workoutId === "object" ? log.workoutId : null;
  const media = workout?.media?.find((item) => item.type === "image") || workout?.media?.[0];
  const imageUrl = resolveMediaUrl(media?.url);

  return (
    <div className="flex items-center gap-3 border-b border-green-100 py-3 last:border-0">
      {imageUrl ? (
        <Image src={imageUrl} alt={workout?.name || "Logged workout"} width={56} height={56} unoptimized className="h-14 w-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <Icon type="flame" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-950">{workout?.name || "Logged workout"}</p>
        <p className="text-xs text-slate-600">{log.duration} minutes</p>
      </div>
      <span className="text-sm font-black text-orange-600">{Math.round(log.caloriesBurned)} kcal</span>
    </div>
  );
}

export default function DashboardPage() {
  const [foodSummary, setFoodSummary] = useState<FoodSummary>(defaultFoodSummary);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(defaultWorkoutSummary);
  const [recentFoodLogs, setRecentFoodLogs] = useState<FoodLog[]>([]);
  const [recentWorkoutLogs, setRecentWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const userData = await getUserData();
      setUserName(userData?.firstName || userData?.username || "there");

      const [profileResult, foodResult, workoutResult] = await Promise.allSettled([
        getUserHealthProfileAction(),
        getTodayFoodSummaryAction(),
        getTodayWorkoutSummaryAction(),
      ]);

      if (profileResult.status === "fulfilled" && profileResult.value.success) {
        setHealthProfile(profileResult.value.data as HealthProfile);
      }

      if (foodResult.status === "fulfilled" && foodResult.value.success) {
        setFoodSummary((foodResult.value.summary as FoodSummary | undefined) || defaultFoodSummary);
        setRecentFoodLogs((foodResult.value.data as FoodLog[] | undefined) || []);
      }

      if (workoutResult.status === "fulfilled" && workoutResult.value.success) {
        setWorkoutSummary((workoutResult.value.summary as WorkoutSummary | undefined) || defaultWorkoutSummary);
        setRecentWorkoutLogs((workoutResult.value.data as WorkoutLog[] | undefined) || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboardData]);

  if (loading) {
    return (
      <PageContainer className="space-y-6" aria-label="Dashboard loading">
        <LoadingSkeleton className="h-44 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <LoadingSkeleton className="h-80 lg:col-span-2" />
          <LoadingSkeleton className="h-80" />
        </div>
      </PageContainer>
    );
  }

  const hasHealthProfile = Boolean(healthProfile);
  const targetCalories = healthProfile?.targetCalories;
  const netCalories = foodSummary.calories - workoutSummary.calories;
  const remainingCalories = targetCalories ? targetCalories - netCalories : null;
  const calorieProgress = progressPercent(netCalories, targetCalories);
  const bmi = healthProfile?.bmi;
  const bmiMarker = bmi ? Math.min(Math.max(((bmi - 15) / 20) * 100, 0), 100) : 0;
  const firstFoodLog = recentFoodLogs[0];
  const firstWorkoutLog = recentWorkoutLogs[0];

  return (
    <PageContainer className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-green-950 text-white shadow-md">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <Badge className="bg-white/12 text-white ring-1 ring-white/20" variant="primary">
              {formatGoal(healthProfile?.goal)}
            </Badge>
            <h1 className="mt-5 text-3xl font-black tracking-normal md:text-4xl">
              {greeting()}, {userName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 md:text-base">
              Your dashboard brings today&apos;s nutrition, movement, and body metrics into one focused view.
              {hasHealthProfile
                ? " Keep your logs fresh so NutriNepal can reflect your current targets."
                : " Complete your health profile to unlock personalized calorie and macro targets."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/log" className="inline-flex">
                <Button>Log activity</Button>
              </Link>
              <Link href={hasHealthProfile ? "/weekly-plan" : "/profile/edit"} className="inline-flex">
                <Button variant="secondary">
                  {hasHealthProfile ? "View weekly plan" : "Update profile"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid min-w-52 content-center gap-3 rounded-xl border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-semibold text-green-50">Today&apos;s target</p>
            <p className="text-4xl font-black">{targetCalories ? Math.round(targetCalories) : "—"}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-green-100">kcal / day</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="daily-overview-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Daily Overview</p>
            <h2 id="daily-overview-heading" className="mt-1 text-2xl font-black text-slate-950">
              Today&apos;s energy balance
            </h2>
          </div>
          <Link
            href="/log"
            className="nn-focus-ring hidden rounded-full px-3 py-2 text-sm font-bold text-green-900 hover:bg-green-100 sm:inline-flex"
          >
            Manage logs
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Calorie Target"
            value={targetCalories ? `${Math.round(targetCalories)}` : "Unavailable"}
            detail={targetCalories ? "From your health profile" : "Complete health profile"}
            icon="chart"
          />
          <MetricCard
            title="Consumed"
            value={`${Math.round(foodSummary.calories)}`}
            detail={recentFoodLogs.length ? `${recentFoodLogs.length} meal log(s) today` : "No meals logged today"}
            icon="food"
          />
          <MetricCard
            title="Burned"
            value={`${Math.round(workoutSummary.calories)}`}
            detail={recentWorkoutLogs.length ? `${recentWorkoutLogs.length} workout log(s) today` : "No workouts logged today"}
            icon="flame"
            tone="orange"
          />
          <MetricCard
            title="Remaining"
            value={remainingCalories === null ? "Unavailable" : `${Math.round(remainingCalories)}`}
            detail={remainingCalories === null ? "Needs calorie target" : "Target - consumed + burned"}
            icon="clock"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-t-4 border-t-green-500 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Body Metrics</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">BMI and current profile</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These values come from your saved health profile.
              </p>
            </div>
            <Badge variant={bmi ? "success" : "neutral"}>{bmiCategory(bmi)}</Badge>
          </div>

          {healthProfile ? (
            <div className="mt-8 grid gap-6 md:grid-cols-[180px_1fr]">
              <div className="flex aspect-square flex-col items-center justify-center rounded-full border-[14px] border-green-100 bg-white shadow-inner">
                <span className="text-sm font-semibold text-slate-600">BMI</span>
                <span className="text-4xl font-black text-green-950">{healthProfile.bmi.toFixed(1)}</span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-300 via-green-500 to-red-500">
                    <span
                      className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-white bg-green-950 shadow"
                      style={{ left: `calc(${bmiMarker}% - 12px)` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-xs font-semibold text-slate-600">
                    <span>Under</span>
                    <span>Normal</span>
                    <span>Over</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Weight</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{healthProfile.weight} kg</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Height</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{healthProfile.height} cm</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Goal</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{formatGoal(healthProfile.goal)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              className="mt-6"
              title="Health profile not complete"
              description="Add your body metrics to show BMI, calorie targets, and macronutrient goals here."
              action={
                <Link href="/profile/edit" className="inline-flex">
                  <Button>Complete profile</Button>
                </Link>
              }
            />
          )}
        </Card>

        <Card className="border-t-4 border-t-green-500 p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Macros</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Daily targets</h2>
            </div>
            <Badge variant={healthProfile ? "primary" : "neutral"}>{healthProfile ? "Personalized" : "Pending"}</Badge>
          </div>
          <div className="space-y-5">
            <MacroBar label="Protein" current={foodSummary.protein} target={healthProfile?.macros?.protein} />
            <MacroBar label="Carbohydrates" current={foodSummary.carbs} target={healthProfile?.macros?.carbs} />
            <MacroBar label="Fat" current={foodSummary.fats} target={healthProfile?.macros?.fats} />
          </div>
          <div className="mt-6 rounded-xl bg-green-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold text-green-950">Calorie progress</span>
              <span className="text-slate-600">{targetCalories ? `${Math.round(calorieProgress)}%` : "Unavailable"}</span>
            </div>
            <div
              aria-label="Calorie progress"
              aria-valuemin={0}
              aria-valuemax={targetCalories || 100}
              aria-valuenow={targetCalories ? Math.round(netCalories) : 0}
              role="progressbar"
              className="h-3 overflow-hidden rounded-full bg-white"
            >
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${calorieProgress}%` }} />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-t-4 border-t-green-500">
          <div className="flex items-center justify-between gap-4 border-b border-green-100 p-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">Meal Preview</h2>
              <p className="mt-1 text-sm text-slate-600">Based on today&apos;s logged meals.</p>
            </div>
            <Link href="/meals" className="nn-focus-ring rounded-full px-3 py-2 text-sm font-bold text-green-900 hover:bg-green-100">
              Meals
            </Link>
          </div>
          <div className="p-6">
            {firstFoodLog ? (
              <>
                <FoodLogRow log={firstFoodLog} />
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Badge variant="primary">{Math.round(firstFoodLog.totalProtein)}g protein</Badge>
                  <Badge variant="neutral">{Math.round(firstFoodLog.totalCarbs)}g carbs</Badge>
                  <Badge variant="warning">{Math.round(firstFoodLog.totalFats)}g fat</Badge>
                </div>
                <Link href="/weekly-plan" className="mt-5 inline-flex">
                  <Button variant="secondary">View weekly plan</Button>
                </Link>
              </>
            ) : (
              <EmptyState
                title="No meals logged today"
                description="Log your first meal to see a personalized meal preview on the dashboard."
                action={
                  <Link href="/meals" className="inline-flex">
                    <Button>Find meals</Button>
                  </Link>
                }
              />
            )}
          </div>
        </Card>

        <Card className="overflow-hidden border-t-4 border-t-green-500">
          <div className="flex items-center justify-between gap-4 border-b border-green-100 p-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">Workout Preview</h2>
              <p className="mt-1 text-sm text-slate-600">Based on today&apos;s logged workouts.</p>
            </div>
            <Link href="/workout" className="nn-focus-ring rounded-full px-3 py-2 text-sm font-bold text-green-900 hover:bg-green-100">
              Workout
            </Link>
          </div>
          <div className="p-6">
            {firstWorkoutLog ? (
              <>
                <WorkoutLogRow log={firstWorkoutLog} />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Duration</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{firstWorkoutLog.duration} min</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Burned</p>
                    <p className="mt-1 text-xl font-black text-orange-600">{Math.round(firstWorkoutLog.caloriesBurned)} kcal</p>
                  </div>
                </div>
                <Link href="/workout" className="mt-5 inline-flex">
                  <Button variant="secondary">View workouts</Button>
                </Link>
              </>
            ) : (
              <EmptyState
                title="No workouts logged today"
                description="Start with a recommended exercise plan, then log your effort here."
                action={
                  <Link href="/workout" className="inline-flex">
                    <Button>View workouts</Button>
                  </Link>
                }
              />
            )}
          </div>
        </Card>
      </section>

      <section aria-labelledby="quick-actions-heading" className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Next Steps</p>
          <h2 id="quick-actions-heading" className="mt-1 text-2xl font-black text-slate-950">
            Quick actions
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/log", title: "Log meal", text: "Add food or exercise" },
            { href: "/meals", title: "Diet recommendations", text: "Review meal ideas" },
            { href: "/progress", title: "View progress", text: "Check health trends" },
            { href: "/profile/edit", title: "Update profile", text: "Refresh your targets" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nn-focus-ring rounded-xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-black text-green-950">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
