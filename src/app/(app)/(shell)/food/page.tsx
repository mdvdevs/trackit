"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Loader2, Plus, UtensilsCrossed, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateHeader } from "@/components/date-header";
import { SearchableSelect } from "@/components/searchable-select";
import { TimePicker } from "@/components/time-picker";
import { MealCard } from "@/components/meal-card";
import { NutritionTable } from "@/components/nutrition-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  saveFoodEntry,
  getFoodSuggestions,
  getMealsByDate,
  deleteMeal,
  saveCustomFood,
} from "@/lib/actions/food-actions";
import { getNutritionProfileWithTargets } from "@/lib/actions/nutrition-profile-actions";
import { cn } from "@/lib/utils";

type SavedMeal = {
  id: string;
  description: string;
  mealTime: string;
  mealLabel: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
};

type PendingCustomFood = {
  name: string;
  servingLabel: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
};

export default function FoodPage() {
  const [date, setDate] = useState(new Date());
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mealTime, setMealTime] = useState(() =>
    format(new Date(), "HH:mm")
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number | null>(
    null
  );
  const [dailyProteinTarget, setDailyProteinTarget] = useState<number | null>(
    null
  );

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingFood, setPendingFood] = useState<PendingCustomFood | null>(
    null
  );
  const [isSavingCustom, startSavingCustom] = useTransition();

  const dateStr = format(date, "yyyy-MM-dd");

  useEffect(() => {
    getFoodSuggestions().then(setSuggestions);
    getNutritionProfileWithTargets().then((d) => {
      if (d.targets) {
        setDailyCalorieTarget(d.targets.dailyCalories);
        setDailyProteinTarget(d.targets.dailyProtein);
      }
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getMealsByDate(dateStr)
      .then((data) => {
        setSavedMeals(
          data.map((m) => ({
            id: m.id,
            description: m.description,
            mealTime: m.mealTime,
            mealLabel: m.mealLabel,
            totalCalories: m.totalCalories,
            totalProtein: m.totalProtein,
            totalCarbs: m.totalCarbs,
            totalFat: m.totalFat,
            items: m.items as SavedMeal["items"],
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, [dateStr]);

  const canAdd = foodName.trim() && quantity.trim();

  const handleAdd = () => {
    if (!canAdd) return;
    const currentFoodName = foodName.trim();
    const currentQuantity = quantity.trim();
    startTransition(async () => {
      const result = await saveFoodEntry(currentFoodName, currentQuantity, dateStr, mealTime);

      const isKnownFood = suggestions.some(
        (s) => s.toLowerCase() === currentFoodName.toLowerCase()
      );
      if (result.source === "ai" && !isKnownFood && result.meals.length > 0) {
        const firstMeal = result.meals[0];
        const firstItem = firstMeal.items[0];
        if (firstItem) {
          setPendingFood({
            name: currentFoodName,
            servingLabel: currentQuantity,
            caloriesPerServing: firstItem.calories,
            proteinPerServing: firstItem.protein,
            carbsPerServing: firstItem.carbs,
            fatPerServing: firstItem.fat,
          });
          setSaveDialogOpen(true);
        }
      }

      setFoodName("");
      setQuantity("");

      const fresh = await getMealsByDate(dateStr);
      setSavedMeals(
        fresh.map((m) => ({
          id: m.id,
          description: m.description,
          mealTime: m.mealTime,
          mealLabel: m.mealLabel,
          totalCalories: m.totalCalories,
          totalProtein: m.totalProtein,
          totalCarbs: m.totalCarbs,
          totalFat: m.totalFat,
          items: m.items as SavedMeal["items"],
        }))
      );

      if (result.source === "ai") {
        getFoodSuggestions().then(setSuggestions);
      }
    });
  };

  const handleSaveCustomFood = () => {
    if (!pendingFood) return;
    startSavingCustom(async () => {
      await saveCustomFood(pendingFood);
      setSaveDialogOpen(false);
      setPendingFood(null);
      getFoodSuggestions().then(setSuggestions);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteMeal(id);
      setSavedMeals((prev) => prev.filter((m) => m.id !== id));
    });
  };

  const mealsByLabel = savedMeals.reduce(
    (acc, meal) => {
      const label = meal.mealLabel;
      if (!acc[label]) acc[label] = [];
      acc[label].push(meal);
      return acc;
    },
    {} as Record<string, SavedMeal[]>
  );

  const labelOrder = ["breakfast", "lunch", "snack", "dinner"];

  const dayCalories = savedMeals.reduce((s, m) => s + m.totalCalories, 0);
  const dayProtein = savedMeals.reduce((s, m) => s + m.totalProtein, 0);
  const overCalories =
    dailyCalorieTarget != null && dayCalories > dailyCalorieTarget;
  const underProtein =
    dailyProteinTarget != null && dayProtein > 0 && dayProtein < dailyProteinTarget;

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2 px-4 pt-4">
        <UtensilsCrossed className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Food Log</h1>
      </div>

      <DateHeader date={date} onDateChange={setDate} />

      {dailyCalorieTarget != null && dailyProteinTarget != null ? (
        <div className="mx-4 mb-3 rounded-xl border bg-card px-3 py-2.5 text-sm">
          <p className="text-muted-foreground">
            Daily allowance:{" "}
            <span className="font-semibold text-foreground">
              {dailyCalorieTarget} kcal
            </span>
            {" · "}
            Protein goal:{" "}
            <span className="font-semibold text-foreground">
              {dailyProteinTarget} g
            </span>
          </p>
          {!isLoading && savedMeals.length > 0 ? (
            <p
              className={cn(
                "mt-1.5 text-xs",
                overCalories || underProtein
                  ? "font-medium text-destructive"
                  : "text-muted-foreground"
              )}
            >
              Logged today: {Math.round(dayCalories)} kcal,{" "}
              {dayProtein.toFixed(1)} g protein
              {overCalories ? " — over calorie budget" : ""}
              {underProtein ? " — below protein goal" : ""}
              {!overCalories && !underProtein ? " — on track" : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Meal time</span>
          <TimePicker value={mealTime} onChange={setMealTime} />
        </div>

        <SearchableSelect
          options={suggestions}
          value={foodName}
          onChange={setFoodName}
          placeholder="Search food..."
          emptyText="No foods found — AI will estimate macros"
        />

        <Input
          placeholder='How much? (e.g. "3 eggs", "1 bowl", "200ml")'
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <Button
          onClick={handleAdd}
          disabled={isPending || !canAdd}
          className="w-full gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isPending ? "Adding..." : "Add Food"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : savedMeals.length > 0 ? (
        <div className="mt-6 space-y-6 px-4">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Meals
            </h2>
            {labelOrder.map((label) => {
              const group = mealsByLabel[label];
              if (!group || group.length === 0) return null;
              return (
                <div key={label} className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    {label}
                  </h3>
                  <div className="flex flex-col">
                    {group.map((meal) => (
                      <MealCard
                        key={meal.id}
                        {...meal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Nutrition Summary
            </h2>
            <NutritionTable
              meals={savedMeals}
              dailyCalorieTarget={dailyCalorieTarget ?? undefined}
              dailyProteinTarget={dailyProteinTarget ?? undefined}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No meals logged for this day
          </p>
          <p className="text-xs text-muted-foreground/70">
            Search a food, enter the quantity, then tap Add Food
          </p>
        </div>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as custom food?</DialogTitle>
            <DialogDescription>
              AI estimated macros for &ldquo;{pendingFood?.name}&rdquo;. Save it
              so next time it&apos;s instant — no AI needed.
            </DialogDescription>
          </DialogHeader>

          {pendingFood && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Serving</span>
                <Input
                  value={pendingFood.servingLabel}
                  onChange={(e) =>
                    setPendingFood((p) =>
                      p ? { ...p, servingLabel: e.target.value } : p
                    )
                  }
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Calories</span>
                <Input
                  type="number"
                  value={pendingFood.caloriesPerServing}
                  onChange={(e) =>
                    setPendingFood((p) =>
                      p
                        ? {
                            ...p,
                            caloriesPerServing: Number(e.target.value) || 0,
                          }
                        : p
                    )
                  }
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Protein (g)
                </span>
                <Input
                  type="number"
                  value={pendingFood.proteinPerServing}
                  onChange={(e) =>
                    setPendingFood((p) =>
                      p
                        ? {
                            ...p,
                            proteinPerServing: Number(e.target.value) || 0,
                          }
                        : p
                    )
                  }
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Carbs (g)</span>
                <Input
                  type="number"
                  value={pendingFood.carbsPerServing}
                  onChange={(e) =>
                    setPendingFood((p) =>
                      p
                        ? {
                            ...p,
                            carbsPerServing: Number(e.target.value) || 0,
                          }
                        : p
                    )
                  }
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Fat (g)</span>
                <Input
                  type="number"
                  value={pendingFood.fatPerServing}
                  onChange={(e) =>
                    setPendingFood((p) =>
                      p
                        ? {
                            ...p,
                            fatPerServing: Number(e.target.value) || 0,
                          }
                        : p
                    )
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                setPendingFood(null);
              }}
            >
              Skip
            </Button>
            <Button
              onClick={handleSaveCustomFood}
              disabled={isSavingCustom}
              className="gap-2"
            >
              {isSavingCustom ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
