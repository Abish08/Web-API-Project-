"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createFoodLogAction, deleteFoodLogAction, getDailyLogsAction, searchFoodsAction } from "./actions";
import { deleteWorkoutLogAction, getWorkoutLogsAction } from "@/app/workout/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Food, FoodLog, MacroTotals, WorkoutLog } from "@/lib/api/types";

const emptySummary: MacroTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

type PendingDelete = {
  type: "food" | "workout";
  id: string;
  name: string;
};

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function foodName(log: FoodLog) {
  return typeof log.foodId === "object" ? log.foodId.name : "Food";
}

function workoutName(log: WorkoutLog) {
  return typeof log.workoutId === "object" ? log.workoutId.name : "Workout";
}

function workoutCategory(log: WorkoutLog) {
  return typeof log.workoutId === "object" ? log.workoutId.category : "";
}

function parsePositiveNumberInput(value: string, fallback = 1) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
}

function SummaryCard({ label, value, detail, tone = "green" }: { label: string; value: string | number; detail?: string; tone?: "green" | "orange" }) {
  return (
    <Card className="border-t-4 border-t-orange-500 p-5">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone === "orange" ? "text-orange-600" : "text-green-950"}`}>{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </Card>
  );
}

function MacroBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-950">{label}</span>
        <span className="text-slate-600">{Math.round(value)}g consumed</span>
      </div>
      <div
        aria-label={`${label} consumed total`}
        aria-valuemin={0}
        aria-valuemax={Math.max(Math.round(value), 100)}
        aria-valuenow={Math.round(value)}
        role="progressbar"
        className="h-2.5 overflow-hidden rounded-full bg-green-50"
      >
        <div className="h-full max-w-full rounded-full bg-green-800" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function LogPage() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [summary, setSummary] = useState<MacroTotals>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("Breakfast");
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const [foodResult, workoutResult] = await Promise.all([
        getDailyLogsAction(selectedDate),
        getWorkoutLogsAction(selectedDate),
      ]);

      if (foodResult.success) {
        setLogs(foodResult.data || []);
        setSummary(foodResult.summary || emptySummary);
      }

      if (workoutResult.success) {
        setWorkoutLogs(workoutResult.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLogs]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length <= 2) {
      setSearchResults([]);
      return;
    }

    const result = await searchFoodsAction(query);
    setSearchResults(result.success ? result.data || [] : []);
  };

  const handleAddLog = async () => {
    if (!selectedFood) return;

    const result = await createFoodLogAction({ foodId: selectedFood._id, servings, mealType, date: selectedDate });
    if (result.success) {
      setSelectedFood(null);
      setSearchQuery("");
      setSearchResults([]);
      setServings(1);
      setMessage(`${selectedFood.name} added to ${mealType}.`);
      void loadLogs();
    } else {
      setMessage(result.message || "Failed to add food log.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleteBusy(true);
    const result = pendingDelete.type === "food"
      ? await deleteFoodLogAction(pendingDelete.id)
      : await deleteWorkoutLogAction(pendingDelete.id);

    if (result.success) {
      setMessage(pendingDelete.type === "food" ? "Food log deleted." : "Workout log deleted.");
      setPendingDelete(null);
      void loadLogs();
    } else {
      setMessage(result.message || "Failed to delete log.");
    }

    setDeleteBusy(false);
  };

  const burnedCalories = workoutLogs.reduce((total, log) => total + (log.caloriesBurned || 0), 0);
  const workoutDuration = workoutLogs.reduce((total, log) => total + (log.duration || 0), 0);
  const netCalories = summary.calories - burnedCalories;

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <LoadingSkeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-4">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
        </div>
        <LoadingSkeleton className="h-80" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Daily Activity Log"
        title="Track Today's Nutrition and Training"
        description={`Selected date: ${selectedDate}. Add meals, review workouts, and keep your daily totals current.`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/meals" className="inline-flex"><Button variant="secondary">Meals</Button></Link>
            <Link href="/workout" className="inline-flex"><Button>Workout</Button></Link>
          </div>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-bold text-slate-950" htmlFor="log-date">Log date</label>
          <input
            id="log-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="nn-focus-ring h-11 rounded-lg border border-green-100 bg-white px-3 text-sm text-slate-950"
          />
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Daily calorie summary">
        <SummaryCard label="Consumed" value={Math.round(summary.calories)} detail={`${logs.length} meal log(s)`} />
        <SummaryCard label="Burned" value={Math.round(burnedCalories)} detail={`${workoutLogs.length} workout log(s)`} tone="orange" />
        <SummaryCard label="Net Calories" value={Math.round(netCalories)} detail="Consumed minus burned" />
        <SummaryCard label="Workout Time" value={`${Math.round(workoutDuration)} min`} detail="Total logged duration" />
      </section>

      {message ? <Card className="p-4 text-sm font-semibold text-green-950">{message}</Card> : null}

      {pendingDelete ? (
        <Card className="border-t-4 border-t-red-500 bg-none bg-red-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-red-800">Delete {pendingDelete.type} log?</h2>
              <p className="mt-1 text-sm text-red-700">
                This will remove <span className="font-bold">{pendingDelete.name}</span> from the selected day.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleteBusy}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => void confirmDelete()} disabled={deleteBusy}>
                {deleteBusy ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="border-t-4 border-t-orange-500 p-5">
            <h2 className="text-xl font-black text-slate-950">Add Meal</h2>
            <p className="mt-1 text-sm text-slate-600">Search backend foods and log servings for the selected date.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_120px_150px_auto]">
              <input
                value={searchQuery}
                onChange={(event) => void handleSearch(event.target.value)}
                className="nn-focus-ring h-11 rounded-lg border border-green-100 px-3"
                placeholder="Search foods..."
                aria-label="Search foods"
              />
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={servings}
                onChange={(event) => setServings(parsePositiveNumberInput(event.target.value))}
                className="nn-focus-ring h-11 rounded-lg border border-green-100 px-3"
                aria-label="Servings"
              />
              <select value={mealType} onChange={(event) => setMealType(event.target.value)} className="nn-focus-ring h-11 rounded-lg border border-green-100 px-3">
                {[
                  ["Breakfast", "Breakfast"],
                  ["Lunch", "Lunch"],
                  ["Dinner", "Dinner"],
                  ["Snack", "Snacks"],
                ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Button onClick={() => void handleAddLog()} disabled={!selectedFood}>Add</Button>
            </div>
            {searchResults.length > 0 ? (
              <div className="mt-3 divide-y divide-green-100 overflow-hidden rounded-xl border border-green-100">
                {searchResults.map((food) => (
                  <button key={food._id} type="button" onClick={() => setSelectedFood(food)} className="nn-focus-ring flex w-full justify-between gap-4 px-4 py-3 text-left text-sm hover:bg-green-50">
                    <span className="font-semibold text-slate-950">{food.name}</span>
                    <span className="text-slate-600">{food.calories} kcal</span>
                  </button>
                ))}
              </div>
            ) : null}
            {selectedFood ? <p className="mt-3 text-sm font-semibold text-green-900">Selected: {selectedFood.name}</p> : null}
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-green-500">
            <div className="border-b border-green-100 p-5">
              <h2 className="text-xl font-black text-slate-950">{logs.length} Meals Logged</h2>
            </div>
            {logs.length ? logs.map((log) => (
              <div key={log._id} className="flex flex-col gap-4 border-b border-green-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950">{foodName(log)}</h3>
                    <Badge variant="primary">{log.mealType}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{log.servings} serving(s) · {Math.round(log.totalCalories)} kcal</p>
                  <p className="mt-1 text-xs text-slate-500">P {Math.round(log.totalProtein)}g · C {Math.round(log.totalCarbs)}g · F {Math.round(log.totalFats)}g</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingDelete({ type: "food", id: log._id, name: foodName(log) })}
                  aria-label={`Delete ${foodName(log)} food log`}
                >
                  Delete
                </Button>
              </div>
            )) : (
              <EmptyState className="m-5" title="No food logged" description="Search and add your first meal for this date." />
            )}
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-green-500">
            <div className="border-b border-green-100 p-5">
              <h2 className="text-xl font-black text-slate-950">{workoutLogs.length} Exercises Logged</h2>
            </div>
            {workoutLogs.length ? workoutLogs.map((log) => (
              <div key={log._id} className="flex flex-col gap-4 border-b border-green-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950">{workoutName(log)}</h3>
                    {workoutCategory(log) ? <Badge variant="warning">{workoutCategory(log)}</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{log.duration} minutes · {Math.round(log.caloriesBurned)} kcal burned</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingDelete({ type: "workout", id: log._id, name: workoutName(log) })}
                  aria-label={`Delete ${workoutName(log)} workout log`}
                >
                  Delete
                </Button>
              </div>
            )) : (
              <EmptyState
                className="m-5"
                title="No workouts logged"
                description="Add workouts from the recommendation page to track calories burned."
                action={<Link href="/workout" className="inline-flex"><Button>View workouts</Button></Link>}
              />
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="border-t-4 border-t-blue-500 bg-none bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Macro Totals</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Consumed today</h2>
            <p className="mt-2 text-sm text-slate-600">Targets are not returned on this page, so these are totals rather than goal progress.</p>
            <div className="mt-6 space-y-5">
              <MacroBar label="Protein" value={summary.protein} />
              <MacroBar label="Carbohydrates" value={summary.carbs} />
              <MacroBar label="Fat" value={summary.fats} />
            </div>
          </Card>

          <Card className="bg-none bg-green-950 p-6 text-white">
            <h2 className="text-xl font-black">Quick Actions</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/meals" className="nn-focus-ring rounded-lg bg-white/10 p-3 text-sm font-bold hover:bg-white/15">View recommendations</Link>
              <Link href="/workout" className="nn-focus-ring rounded-lg bg-white/10 p-3 text-sm font-bold hover:bg-white/15">Add workout</Link>
              <Link href="/progress" className="nn-focus-ring rounded-lg bg-white/10 p-3 text-sm font-bold hover:bg-white/15">View progress</Link>
            </div>
          </Card>
        </aside>
      </section>
    </PageContainer>
  );
}
