"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getDietRecommendation } from "@/lib/api/recommendations";
import { createFoodLogAction, fetchFoodsAction } from "@/app/meals/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { DietRecommendation, Food, MacroTotals } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media";

function formatMealName(meal: string) {
  if (meal === "all") return "All";
  return meal.replace(/[-_]/g, " ");
}

function toMealLogType(meal: string) {
  const normalized = meal.trim().toLowerCase();
  if (normalized === "breakfast") return "Breakfast";
  if (normalized === "lunch") return "Lunch";
  if (normalized === "dinner") return "Dinner";
  if (normalized === "snack" || normalized === "snacks") return "Snack";
  return meal.charAt(0).toUpperCase() + meal.slice(1);
}

function foodImage(food: Food) {
  return resolveMediaUrl(food.images?.[0]?.url || food.thumbnail?.url) || "";
}

function normalizeMealCategory(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "snack" || normalized === "snacks") return "snacks";
  return normalized;
}

function extractFoods(response: unknown): Food[] {
  if (!response || typeof response !== "object") return [];
  const data = (response as { data?: unknown }).data;
  if (Array.isArray(data)) return data as Food[];
  if (data && typeof data === "object" && Array.isArray((data as { foods?: unknown }).foods)) {
    return (data as { foods: Food[] }).foods;
  }
  return [];
}

function MacroBar({ label, value, target }: { label: string; value: number; target: number }) {
  const percent = target > 0 ? Math.min(Math.max((value / target) * 100, 0), 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-950">{label}</span>
        <span className="text-slate-600">
          {Math.round(value)} / {Math.round(target)}g
        </span>
      </div>
      <div
        aria-label={`${label} recommendation progress`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.round(value)}
        role="progressbar"
        className="h-2.5 overflow-hidden rounded-full bg-green-50"
      >
        <div className="h-full rounded-full bg-green-800" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function FoodVisual({ food }: { food: Food }) {
  const imageUrl = foodImage(food);

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={food.name}
        width={640}
        height={320}
        unoptimized
        className="h-40 w-full object-cover"
      />
    );
  }

  return (
    <div
      aria-label={`${food.name} placeholder image`}
      role="img"
      className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 text-center text-sm font-bold text-green-950"
    >
      <span className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-white/55" />
      <span className="absolute -bottom-12 right-6 h-32 w-32 rounded-full bg-orange-200/45" />
      <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
        Meal
      </span>
    </div>
  );
}

function MealCard({
  food,
  mealType,
  recommended,
  onLog,
  onView,
  logging,
}: {
  food: Food;
  mealType: string;
  recommended: boolean;
  onLog: (food: Food, mealType: string) => void;
  onView: (food: Food) => void;
  logging: boolean;
}) {
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,81,45,0.12)]">
      <FoodVisual food={food} />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-black text-slate-950">{food.name}</h3>
            <p className="mt-1 text-sm capitalize text-slate-600">
              {food.category || formatMealName(mealType)}
            </p>
          </div>
          {recommended ? <Badge className="shrink-0" variant="primary">Recommended</Badge> : null}
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-orange-50 p-2">
            <p className="text-xs text-slate-600">Kcal</p>
            <p className="font-black text-slate-950">{Math.round(food.calories)}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2">
            <p className="text-xs text-slate-600">P</p>
            <p className="font-black text-blue-700">{Math.round(food.protein)}g</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-xs text-slate-600">C</p>
            <p className="font-black text-emerald-700">{Math.round(food.carbs)}g</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-2">
            <p className="text-xs text-slate-600">F</p>
            <p className="font-black text-amber-700">{Math.round(food.fats)}g</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {food.dietaryTags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="neutral">{tag}</Badge>
          ))}
          {food.suitableGoals?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="success">{tag}</Badge>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => onView(food)}>
            View Meal
          </Button>
          <Button disabled={logging} onClick={() => onLog(food, mealType)}>
            {logging ? "Logging..." : "Log Meal"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function MealsPage() {
  const [data, setData] = useState<DietRecommendation | null>(null);
  const [catalogFoods, setCatalogFoods] = useState<Food[]>([]);
  const [activeMeal, setActiveMeal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [loggingFoodId, setLoggingFoodId] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await getDietRecommendation();
        if (result.success) {
          setData(result.data);
          setActiveMeal(Object.keys(result.data.meals)[0] || "");
        }
        const foodsResult = await fetchFoodsAction("all");
        setCatalogFoods(extractFoods(foodsResult));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load diet recommendations");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const mealEntries = useMemo(() => Object.entries(data?.meals || {}), [data]);
  const mealKeys = useMemo(() => {
    const keys = new Set(mealEntries.map(([meal]) => normalizeMealCategory(meal)));
    catalogFoods.forEach((food) => keys.add(normalizeMealCategory(food.category)));
    return Array.from(keys).filter((meal) => ["breakfast", "lunch", "dinner", "snacks"].includes(meal));
  }, [catalogFoods, mealEntries]);
  const visibleFoods = useMemo(() => {
    const recommendedIds = new Set(mealEntries.flatMap(([, foods]) => foods.map((food) => food._id)));
    const rows = new Map<string, { food: Food; meal: string; recommended: boolean }>();

    mealEntries.forEach(([meal, foods]) => {
      const normalizedMeal = normalizeMealCategory(meal);
      foods.forEach((food) => rows.set(food._id, { food, meal: normalizedMeal, recommended: true }));
    });

    catalogFoods.forEach((food) => {
      const normalizedMeal = normalizeMealCategory(food.category);
      if (!["breakfast", "lunch", "dinner", "snacks"].includes(normalizedMeal)) return;
      if (!rows.has(food._id)) {
        rows.set(food._id, { food, meal: normalizedMeal, recommended: recommendedIds.has(food._id) });
      }
    });

    const allRows = Array.from(rows.values());
    return activeMeal === "all" ? allRows : allRows.filter((row) => row.meal === normalizeMealCategory(activeMeal));
  }, [activeMeal, catalogFoods, mealEntries]);
  const activeTotal = activeMeal === "all" ? data?.dailyTotals : data?.mealTotals[activeMeal];

  async function handleLogMeal(food: Food, mealType: string) {
    setLoggingFoodId(food._id);
    setLogMessage("");

    try {
      const result = await createFoodLogAction({
        foodId: food._id,
        servings: 1,
        mealType: toMealLogType(mealType),
      });

      setLogMessage(result.success ? `${food.name} logged successfully.` : result.message || "Failed to log meal.");
    } finally {
      setLoggingFoodId("");
    }
  }

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
        <div className="grid gap-5 md:grid-cols-3">
          <LoadingSkeleton className="h-80" />
          <LoadingSkeleton className="h-80" />
          <LoadingSkeleton className="h-80" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="Diet recommendations unavailable"
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

  if (!data) {
    return (
      <PageContainer>
        <EmptyState title="No meal recommendations yet" description="Complete your health profile to generate personalized meals." />
      </PageContainer>
    );
  }

  const dailyTotals: MacroTotals = data.dailyTotals;

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        eyebrow="Diet recommendation"
        title="Your Daily Nutrition Plan"
        description="Meals matched to your current health profile and daily nutrition targets."
        action={
          <Link href="/weekly-plan" className="inline-flex">
            <Button variant="secondary">Weekly Plan</Button>
          </Link>
        }
      />

      {data.contentWarning ? (
        <Card className="border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          {data.contentWarning}
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Nutrition targets">
        {[
          ["Calories", data.targets.calories, "kcal"],
          ["Protein", data.targets.protein, "g"],
          ["Carbs", data.targets.carbs, "g"],
          ["Fat", data.targets.fats, "g"],
        ].map(([label, value, unit]) => (
          <Card key={label} className="p-5">
            <p className="text-sm font-semibold text-slate-600">{label}</p>
            <p className="mt-2 text-3xl font-black text-green-950">
              {Math.round(Number(value))} <span className="text-sm font-bold text-slate-500">{unit}</span>
            </p>
          </Card>
        ))}
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Meal type">
        <button
          type="button"
          role="tab"
          aria-selected={activeMeal === "all"}
          onClick={() => setActiveMeal("all")}
          className={`nn-focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
            activeMeal === "all"
              ? "bg-green-950 text-white"
              : "border border-green-100 bg-white text-slate-700 hover:bg-green-50 hover:text-green-950"
          }`}
        >
          All
        </button>
        {mealKeys.map((meal) => (
          <button
            key={meal}
            type="button"
            role="tab"
            aria-selected={activeMeal === meal}
            onClick={() => setActiveMeal(meal)}
            className={`nn-focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
              activeMeal === meal
                ? "bg-green-950 text-white"
                : "border border-green-100 bg-white text-slate-700 hover:bg-green-50 hover:text-green-950"
            }`}
          >
            {formatMealName(meal)}
          </button>
        ))}
      </div>

      {logMessage ? (
        <Card className="p-4 text-sm font-semibold text-green-950">{logMessage}</Card>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black capitalize text-slate-950">{formatMealName(activeMeal)}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {activeTotal
                  ? `${Math.round(activeTotal.calories)} kcal planned${activeMeal === "all" ? " today" : " for this meal"}.`
                  : "Recommended foods for this meal type."}
              </p>
            </div>
          </div>

          {visibleFoods.length ? (
            <div className={visibleFoods.length === 1 ? "grid max-w-md gap-5" : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
              {visibleFoods.map(({ food, meal, recommended }) => (
                <MealCard
                  key={`${meal}-${food._id}`}
                  food={food}
                  mealType={meal}
                  recommended={recommended}
                  logging={loggingFoodId === food._id}
                  onLog={handleLogMeal}
                  onView={setSelectedFood}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No foods available"
              description="No backend recommendations were returned for this meal type."
            />
          )}
        </div>

        <aside className="space-y-5">
          <Card className="border-t-4 border-t-emerald-500 bg-none bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Macro Summary</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Daily recommendation</h2>
            <p className="mt-2 text-sm text-slate-600">
              {Math.round(dailyTotals.calories)} kcal recommended today.
            </p>
            <div className="mt-6 space-y-5">
              <MacroBar label="Protein" value={dailyTotals.protein} target={data.targets.protein} />
              <MacroBar label="Carbohydrates" value={dailyTotals.carbs} target={data.targets.carbs} />
              <MacroBar label="Fat" value={dailyTotals.fats} target={data.targets.fats} />
            </div>
          </Card>

          <Card className="overflow-hidden bg-none bg-green-950 p-0 text-white">
            <div className="relative min-h-40 p-6">
              <span className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
              <span className="absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-orange-400/20" />
              <Badge className="relative bg-white/10 text-white ring-1 ring-white/15" variant="primary">Nutrition Tip</Badge>
              <p className="relative mt-4 text-lg font-black">Stay consistent with your targets.</p>
              <p className="relative mt-2 text-sm leading-6 text-green-50">
                Difference from target: {Math.round(data.differenceFromTarget.calories)} kcal.
              </p>
            </div>
          </Card>
        </aside>
      </section>

      {selectedFood ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-none bg-white p-0 shadow-2xl">
            <FoodVisual food={selectedFood} />
            <div className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="primary">{selectedFood.category}</Badge>
                  <h2 className="mt-3 text-2xl font-black text-slate-950">{selectedFood.name}</h2>
                  {selectedFood.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{selectedFood.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="nn-focus-ring rounded-full border border-green-100 px-3 py-1 text-sm font-black text-slate-600 hover:bg-green-50"
                  aria-label="Close meal details"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Calories", selectedFood.calories, "kcal"],
                  ["Protein", selectedFood.protein, "g"],
                  ["Carbs", selectedFood.carbs, "g"],
                  ["Fat", selectedFood.fats, "g"],
                ].map(([label, value, unit]) => (
                  <div key={label} className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-black text-green-950">{Math.round(Number(value))} {unit}</p>
                  </div>
                ))}
              </div>

              {selectedFood.dietaryTags?.length || selectedFood.suitableGoals?.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFood.dietaryTags?.map((tag) => <Badge key={tag} variant="neutral">{tag}</Badge>)}
                  {selectedFood.suitableGoals?.map((tag) => <Badge key={tag} variant="success">{tag}</Badge>)}
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={() => setSelectedFood(null)}>
                  Back to Meals
                </Button>
                <Button onClick={() => handleLogMeal(selectedFood, selectedFood.category)}>
                  Log Meal
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}
