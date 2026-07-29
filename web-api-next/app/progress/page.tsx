"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCalorieHistoryAction, getSummaryAction, getWorkoutHistoryAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";

type HistoryPoint = {
  _id?: string;
  date?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  duration?: number;
  totalDuration?: number;
  totalCaloriesBurned?: number;
  workoutCount?: number;
};

type ProgressSummary = {
  totalCalories?: number;
  totalWorkoutCalories?: number;
  totalWorkoutDuration?: number;
  averageCalories?: number;
};

type ComputedSummary = {
  totalCalories: number;
  averageCalories: number;
  totalWorkoutCalories: number;
  totalWorkoutDuration: number;
  foodDays: number;
  workoutDays: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dateValue(point: HistoryPoint) {
  return point.date || point._id || "";
}

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function aggregateByDate(data: HistoryPoint[]) {
  const byDate = new Map<string, HistoryPoint>();

  data.forEach((point, index) => {
    const key = dateValue(point) || `record-${index}`;
    const current = byDate.get(key) || {};

    byDate.set(key, {
      _id: key,
      date: key,
      calories: toNumber(current.calories) + toNumber(point.calories),
      protein: toNumber(current.protein) + toNumber(point.protein),
      carbs: toNumber(current.carbs) + toNumber(point.carbs),
      fats: toNumber(current.fats) + toNumber(point.fats),
      duration: toNumber(current.duration) + toNumber(point.duration),
      totalDuration: toNumber(current.totalDuration) + toNumber(point.totalDuration),
      totalCaloriesBurned: toNumber(current.totalCaloriesBurned) + toNumber(point.totalCaloriesBurned),
      workoutCount: toNumber(current.workoutCount) + toNumber(point.workoutCount),
    });
  });

  return Array.from(byDate.values()).sort((a, b) => dateValue(a).localeCompare(dateValue(b)));
}

function computeSummary(foodHistory: HistoryPoint[], workouts: HistoryPoint[]): ComputedSummary {
  const foodByDate = aggregateByDate(foodHistory);
  const workoutsByDate = aggregateByDate(workouts);
  const foodDaysWithRecords = foodByDate.filter((point) => toNumber(point.calories) > 0);
  const workoutDaysWithRecords = workoutsByDate.filter(
    (point) => toNumber(point.totalDuration) > 0 || toNumber(point.duration) > 0 || toNumber(point.totalCaloriesBurned) > 0
  );
  const totalCalories = foodByDate.reduce((total, point) => total + toNumber(point.calories), 0);
  const totalWorkoutCalories = workoutsByDate.reduce((total, point) => total + toNumber(point.totalCaloriesBurned), 0);
  const totalWorkoutDuration = workoutsByDate.reduce(
    (total, point) => total + toNumber(point.totalDuration || point.duration),
    0
  );

  return {
    totalCalories,
    averageCalories: foodDaysWithRecords.length ? totalCalories / foodDaysWithRecords.length : 0,
    totalWorkoutCalories,
    totalWorkoutDuration,
    foodDays: foodDaysWithRecords.length,
    workoutDays: workoutDaysWithRecords.length,
  };
}

function MetricCard({ label, value, unit, detail }: { label: string; value: number; unit?: string; detail?: string }) {
  return (
    <Card className="border-t-4 border-t-green-500 p-5">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-black text-green-950">
        {Math.round(value)} {unit ? <span className="text-sm font-bold text-slate-500">{unit}</span> : null}
      </p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </Card>
  );
}

function ChartShell({
  title,
  description,
  children,
  emptyTitle,
  emptyDescription,
  emptyHref,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyHref: string;
}) {
  return (
    <Card className="border-t-4 border-t-green-500 p-5">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children ? (
        children
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Link href={emptyHref} className="inline-flex">
              <Button>Log activity</Button>
            </Link>
          }
        />
      )}
    </Card>
  );
}

function tooltipStyle() {
  return {
    border: "1px solid #86efac",
    borderRadius: "14px",
    boxShadow: "0 18px 42px rgba(15,23,42,.12)",
    color: "#0f172a",
  };
}

function CaloriesChart({ data }: { data: HistoryPoint[] }) {
  const chartData = data.map((point) => ({
    label: formatDate(dateValue(point)),
    calories: Math.round(toNumber(point.calories)),
    protein: Math.round(toNumber(point.protein)),
    carbs: Math.round(toNumber(point.carbs)),
    fats: Math.round(toNumber(point.fats)),
  }));

  if (!chartData.length) {
    return null;
  }

  return (
    <>
      <p className="sr-only">Calorie and macro area chart with {chartData.length} real logged data point(s).</p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 18, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="calories-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#15803d" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#15803d" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="protein-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#bbf7d0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <YAxis yAxisId="calories" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <YAxis yAxisId="macros" hide />
            <Tooltip cursor={{ stroke: "#15803d", strokeOpacity: 0.22 }} contentStyle={tooltipStyle()} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
            <Area
              yAxisId="calories"
              type="monotone"
              name="Calories"
              dataKey="calories"
              stroke="#15803d"
              strokeWidth={3}
              fill="url(#calories-gradient)"
              dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
              activeDot={{ r: 7 }}
              isAnimationActive
            />
            <Area
              yAxisId="macros"
              type="monotone"
              name="Protein"
              dataKey="protein"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#protein-gradient)"
              dot={false}
              isAnimationActive
            />
            <Area
              yAxisId="macros"
              type="monotone"
              name="Carbs"
              dataKey="carbs"
              stroke="#10b981"
              strokeWidth={2}
              fill="transparent"
              dot={false}
              isAnimationActive
            />
            <Area
              yAxisId="macros"
              type="monotone"
              name="Fat"
              dataKey="fats"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="transparent"
              dot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function WorkoutChart({ data }: { data: HistoryPoint[] }) {
  const chartData = data.map((point) => ({
    label: formatDate(dateValue(point)),
    duration: Math.round(toNumber(point.totalDuration || point.duration)),
    caloriesBurned: Math.round(toNumber(point.totalCaloriesBurned)),
  }));
  const hasDuration = chartData.some((point) => point.duration > 0);
  const hasBurnedCalories = chartData.some((point) => point.caloriesBurned > 0);

  if (!chartData.length || (!hasDuration && !hasBurnedCalories)) {
    return null;
  }

  return (
    <>
      <p className="sr-only">Workout chart with {chartData.length} real logged data point(s).</p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 18, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="workout-duration-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.86} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ddd6fe" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <YAxis yAxisId="duration" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <YAxis yAxisId="calories" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
            <Tooltip cursor={{ fill: "rgba(139, 92, 246, 0.08)" }} contentStyle={tooltipStyle()} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
            {hasDuration ? (
              <Bar
                yAxisId="duration"
                name="Workout minutes"
                dataKey="duration"
                fill="url(#workout-duration-gradient)"
                radius={[10, 10, 0, 0]}
                isAnimationActive
              />
            ) : null}
            {hasBurnedCalories ? (
              <Line
                yAxisId="calories"
                type="monotone"
                name="Calories burned"
                dataKey="caloriesBurned"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                activeDot={{ r: 7 }}
                isAnimationActive
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default function ProgressPage() {
  const [calorieHistory, setCalorieHistory] = useState<HistoryPoint[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<HistoryPoint[]>([]);
  const [summary, setSummary] = useState<ProgressSummary>({});
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const [calories, workouts, summaryResult] = await Promise.all([
        getCalorieHistoryAction(30),
        getWorkoutHistoryAction(30),
        getSummaryAction(),
      ]);

      if (calories.success) setCalorieHistory(calories.data || []);
      if (workouts.success) setWorkoutHistory(workouts.data || []);
      if (summaryResult.success) setSummary(summaryResult.data || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProgress();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProgress]);

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
        <div className="grid gap-6 lg:grid-cols-2">
          <LoadingSkeleton className="h-96" />
          <LoadingSkeleton className="h-96" />
        </div>
      </PageContainer>
    );
  }

  const latestCalories = calorieHistory.at(-1);
  const latestWorkout = workoutHistory.at(-1);
  const hasAnyHistory = calorieHistory.length > 0 || workoutHistory.length > 0;
  const computedSummary = computeSummary(calorieHistory, workoutHistory);
  void summary;

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Progress Tracker"
        title="Your Progress"
        description="Review your real calorie intake and workout consistency from the last 30 days."
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/log" className="inline-flex"><Button>Log activity</Button></Link>
            <Link href="/profile" className="inline-flex"><Button variant="secondary">Profile</Button></Link>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Progress summary metrics">
        <MetricCard label="Total Calories" value={computedSummary.totalCalories} unit="kcal" detail={`${computedSummary.foodDays} logged food day(s)`} />
        <MetricCard label="Average Calories" value={computedSummary.averageCalories} unit="kcal" detail="Average across logged food days" />
        <MetricCard label="Workout Burn" value={computedSummary.totalWorkoutCalories} unit="kcal" detail={`${computedSummary.workoutDays} logged workout day(s)`} />
        <MetricCard label="Workout Minutes" value={computedSummary.totalWorkoutDuration} unit="min" detail="Total duration from history" />
      </section>

      {!hasAnyHistory ? (
        <Card className="border-t-4 border-t-orange-500 bg-none bg-orange-50 p-5">
          <p className="text-sm font-bold text-orange-900">
            No activity logged yet. Start logging meals and workouts to see your progress.
          </p>
        </Card>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartShell
          title="Calorie Intake Trend"
          description="Daily calories from actual food logs."
          emptyTitle="No calorie history yet"
          emptyDescription="Log meals for a few days to build your intake trend."
          emptyHref="/log"
        >
          <CaloriesChart data={calorieHistory} />
        </ChartShell>
        <ChartShell
          title="Workout Duration Trend"
          description="Daily workout minutes and calories burned from actual exercise logs."
          emptyTitle="No workout history yet"
          emptyDescription="Log workouts to see your consistency over time."
          emptyHref="/workout"
        >
          <WorkoutChart data={workoutHistory} />
        </ChartShell>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-t-4 border-t-green-500 p-5">
          <h2 className="text-xl font-black text-slate-950">Recent History</h2>
          <p className="mt-1 text-sm text-slate-600">Latest available real data points.</p>
          <div className="mt-5 space-y-3">
            {latestCalories ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                <span className="font-semibold text-slate-950">Latest calorie entry</span>
                <span className="text-sm font-black text-green-950">{formatDate(dateValue(latestCalories))} · {Math.round(toNumber(latestCalories.calories))} kcal</span>
              </div>
            ) : null}
            {latestWorkout ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                <span className="font-semibold text-slate-950">Latest workout entry</span>
                <span className="text-sm font-black text-orange-600">{formatDate(dateValue(latestWorkout))} · {Math.round(toNumber(latestWorkout.totalDuration || latestWorkout.duration))} min</span>
              </div>
            ) : null}
            {!latestCalories && !latestWorkout ? (
              <EmptyState title="No recent history" description="Log food or workouts to populate recent activity." />
            ) : null}
          </div>
        </Card>

        <Card className="border-t-4 border-t-green-500 p-5">
          <h2 className="text-xl font-black text-slate-950">Body Measurement Charts</h2>
          <p className="mt-1 text-sm text-slate-600">
            Weight and BMI history are not returned by the current progress actions.
          </p>
          <div className="mt-5">
            <EmptyState
              title="Weight and BMI history unavailable"
              description="The current backend progress endpoints provide calorie and workout history only."
              action={
                <Link href="/profile" className="inline-flex">
                  <Button variant="secondary">View profile</Button>
                </Link>
              }
            />
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
