"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Loader2, Save, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateHeader } from "@/components/date-header";
import { NoteEditor } from "@/components/note-editor";
import { TimePicker } from "@/components/time-picker";
import { MealCard } from "@/components/meal-card";
import { NutritionTable } from "@/components/nutrition-table";
import {
  saveFoodEntry,
  getMealsByDate,
  deleteMeal,
} from "@/lib/actions/food-actions";

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

export default function FoodPage() {
  const [date, setDate] = useState(new Date());
  const [text, setText] = useState("");
  const [mealTime, setMealTime] = useState(() =>
    format(new Date(), "HH:mm")
  );
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const dateStr = format(date, "yyyy-MM-dd");

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

  const handleSave = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      await saveFoodEntry(text.trim(), dateStr, mealTime);
      setText("");
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
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteMeal(id);
      setSavedMeals((prev) => prev.filter((m) => m.id !== id));
    });
  };

  const handleEdit = (id: string) => {
    const meal = savedMeals.find((m) => m.id === id);
    if (!meal) return;

    setText(meal.description);
    setMealTime(meal.mealTime);
    
    // Delete the original so it doesn't double-save
    handleDelete(id);

    // Scroll to top where the editor is
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2 px-4 pt-4">
        <UtensilsCrossed className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Food Log</h1>
      </div>

      <DateHeader date={date} onDateChange={setDate} />

      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Meal time</span>
          <TimePicker value={mealTime} onChange={setMealTime} />
        </div>

        <div className="rounded-xl border bg-card">
          <NoteEditor
            value={text}
            onChange={setText}
            placeholder={`Type what you ate... e.g. 2 rotis with dal`}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || !text.trim()}
          className="mt-3 w-full gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? "Parsing with AI..." : "Save & Parse"}
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
                        onEdit={handleEdit}
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
            <NutritionTable meals={savedMeals} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No meals logged for this day
          </p>
          <p className="text-xs text-muted-foreground/70">
            Type what you ate above and hit Save
          </p>
        </div>
      )}
    </div>
  );
}
