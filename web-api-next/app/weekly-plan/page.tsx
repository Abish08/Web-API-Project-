"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getWeeklyPlan } from "@/lib/api/recommendations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Food, WeeklyPlan, WorkoutRecommendation } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";

const isWorkoutRecommendation = (value: WeeklyPlan[string]["workout"]): value is WorkoutRecommendation =>
  "workouts" in value;

function formatLabel(value: string) {
  return value.replace(/[-_]/g, " ");
}

function foodImage(food: Food) {
  return resolveMediaUrl(food.images?.[0]?.url || food.thumbnail?.url) || "";
}

function MiniMealCard({ food }: { food: Food }) {
  const imageUrl = foodImage(food);

  return (
    <div className="flex gap-3 rounded-xl border border-green-100 bg-white p-3">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={food.name}
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div
          aria-label={`${food.name} placeholder image`}
          role="img"
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 text-xs font-black text-green-950"
        >
          Meal
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-black text-slate-950">{food.name}</p>
        <p className="mt-1 text-xs text-slate-600">{Math.round(food.calories)} kcal</p>
        <p className="mt-2 text-xs font-medium text-slate-500">
          P {Math.round(food.protein)}g · C {Math.round(food.carbs)}g · F {Math.round(food.fats)}g
        </p>
      </div>
    </div>
  );
}

export default function WeeklyPlanPage() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [activeDay, setActiveDay] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await getWeeklyPlan();
        if (result.success) {
          setPlan(result.data);
          setActiveDay(Object.keys(result.data)[0] || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weekly plan");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <LoadingSkeleton className="h-36" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-10 w-24" />
          <LoadingSkeleton className="h-10 w-24" />
          <LoadingSkeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <LoadingSkeleton className="h-96" />
          <LoadingSkeleton className="h-96" />
        </div>
      </PageContainer>
    );
  }

  if (error || !plan) {
    return (
      <PageContainer>
        <EmptyState
          title="Weekly plan unavailable"
          description={error || "No weekly plan was returned from the backend."}
          action={
            <Link href="/profile" className="inline-flex">
              <Button>Complete health profile</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const days = Object.keys(plan);
  const selected = plan[activeDay];
  const calorieTarget = selected?.dailyTotals.calories || 0;
  const weeklyCalories = days.reduce((total, day) => total + (plan[day]?.dailyTotals.calories || 0), 0);
  const averageCalories = days.length ? Math.round(weeklyCalories / days.length) : 0;

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Weekly meal plan"
        title="Weekly Nutrition Roadmap"
        description="Move through each day to review generated meal sections and daily nutrition totals."
        action={
          <Link href="/meals" className="inline-flex">
            <Button variant="secondary">Diet Recommendations</Button>
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Weekly summary">
        <Card className="border-t-4 border-t-orange-500 p-5">
          <p className="text-sm font-semibold text-slate-600">Planned Days</p>
          <p className="mt-2 text-3xl font-black text-green-950">{days.length}</p>
        </Card>
        <Card className="border-t-4 border-t-orange-500 p-5">
          <p className="text-sm font-semibold text-slate-600">Average Calories</p>
          <p className="mt-2 text-3xl font-black text-green-950">{averageCalories}</p>
        </Card>
        <Card className="border-t-4 border-t-orange-500 p-5">
          <p className="text-sm font-semibold text-slate-600">Selected Day</p>
          <p className="mt-2 text-3xl font-black capitalize text-green-950">{formatLabel(activeDay)}</p>
        </Card>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Weekly plan days">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            role="tab"
            aria-selected={activeDay === day}
            onClick={() => setActiveDay(day)}
            className={`nn-focus-ring shrink-0 rounded-full px-5 py-2.5 text-sm font-black capitalize transition ${
              activeDay === day
                ? "bg-green-950 text-white shadow-sm"
                : "border border-green-100 bg-white text-slate-600 hover:bg-green-50 hover:text-green-950"
            }`}
          >
            {formatLabel(day)}
          </button>
        ))}
      </div>

      {selected ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {Object.entries(selected.meals).map(([meal, foods]) => (
              <Card key={meal} className="p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black capitalize text-slate-950">{formatLabel(meal)}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {selected.mealTotals[meal]?.calories
                        ? `${Math.round(selected.mealTotals[meal].calories)} kcal planned`
                        : "No meal total available"}
                    </p>
                  </div>
                  <Badge variant="primary">{foods.length} item(s)</Badge>
                </div>
                {foods.length ? (
                  <div className={foods.length === 1 ? "grid max-w-md gap-3" : "grid gap-3 md:grid-cols-2"}>
                    {foods.map((food) => (
                      <MiniMealCard key={food._id} food={food} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    className="py-8"
                    title="No foods assigned"
                    description="The backend did not return foods for this meal section."
                  />
                )}
              </Card>
            ))}
          </div>

          <aside className="space-y-5">
            <Card className="border-t-4 border-t-purple-500 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Daily Summary</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{Math.round(calorieTarget)} kcal</h2>
              <p className="mt-2 text-sm text-slate-600">Generated total for {formatLabel(activeDay)}.</p>

              <div className="mt-6 grid gap-3">
                {[
                  ["Protein", selected.dailyTotals.protein],
                  ["Carbs", selected.dailyTotals.carbs],
                  ["Fat", selected.dailyTotals.fats],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <span className="text-sm font-semibold text-slate-600">{label}</span>
                    <span className="text-sm font-black text-slate-950">{Math.round(Number(value))}g</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-green-50 p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-bold text-green-950">Goal progress</span>
                  <span className="text-slate-600">Generated</span>
                </div>
                <div
                  aria-label="Daily meal plan progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={100}
                  className="h-3 overflow-hidden rounded-full bg-white"
                >
                  <div className="h-full rounded-full bg-orange-500" style={{ width: "100%" }} />
                </div>
              </div>
            </Card>

            <Card className="border-t-4 border-t-purple-500 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Workout Guidance</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Today&apos;s movement</h2>
              <div className="mt-5 space-y-3">
                {isWorkoutRecommendation(selected.workout) ? (
                  selected.workout.workouts.length ? (
                    selected.workout.workouts.map((workout) => (
                      <div key={workout._id} className="rounded-xl border border-green-100 p-4">
                        <p className="font-black text-slate-950">{workout.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {workout.duration} min · {workout.difficulty}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="primary">{workout.category}</Badge>
                          {workout.goalTags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="neutral">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      className="py-8"
                      title="No workouts assigned"
                      description="The backend returned a workout recommendation without exercises."
                    />
                  )
                ) : (
                  <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-950">
                    {selected.workout.message}
                  </div>
                )}
              </div>
              <Link href="/workout" className="mt-5 inline-flex">
                <Button variant="secondary">Open workout plan</Button>
              </Link>
            </Card>
          </aside>
        </section>
      ) : (
        <EmptyState title="No day selected" description="Choose a day to inspect your generated meal plan." />
      )}
    </PageContainer>
  );
}
