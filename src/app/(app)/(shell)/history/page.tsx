"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Dumbbell,
  UtensilsCrossed,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { ExerciseCard } from "@/components/exercise-card";
import { MealCard } from "@/components/meal-card";
import { getHistoryDates } from "@/lib/actions/progress-actions";

type HistoryExercise = {
  id: string;
  name: string;
  sets: { weight: number; unit: string; reps?: number }[];
  date: string;
};

type HistoryMeal = {
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
  date: string;
};

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workouts, setWorkouts] = useState<HistoryExercise[]>([]);
  const [meals, setMeals] = useState<HistoryMeal[]>([]);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    const start = format(subDays(new Date(), 90), "yyyy-MM-dd");
    const end = format(new Date(), "yyyy-MM-dd");

    getHistoryDates(start, end).then(({ workouts: w, meals: m }) => {
      const dates = new Set<string>();
      w.forEach((ex) => dates.add(ex.date));
      m.forEach((meal) => dates.add(meal.date));
      setActiveDates(dates);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const start = selectedDateStr;
    const end = selectedDateStr;

    getHistoryDates(start, end).then(({ workouts: w, meals: m }) => {
      setWorkouts(
        w.map((ex) => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets as HistoryExercise["sets"],
          date: ex.date,
        }))
      );
      setMeals(
        m.map((meal) => ({
          id: meal.id,
          description: meal.description,
          mealTime: meal.mealTime,
          mealLabel: meal.mealLabel,
          totalCalories: meal.totalCalories,
          totalProtein: meal.totalProtein,
          totalCarbs: meal.totalCarbs,
          totalFat: meal.totalFat,
          items: meal.items as HistoryMeal["items"],
          date: meal.date,
        }))
      );
      setIsLoading(false);
    });
  }, [selectedDateStr]);

  const totalCalories = meals.reduce((s, m) => s + m.totalCalories, 0);

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/me" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">History</h1>
      </div>

      <div className="flex justify-center py-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          modifiers={{
            active: (date) => activeDates.has(format(date, "yyyy-MM-dd")),
          }}
          modifiersClassNames={{
            active: "bg-primary/20 font-bold",
          }}
          disabled={(date) => date > new Date()}
        />
      </div>

      <Separator />

      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {format(selectedDate, "EEEE, d MMM yyyy")}
          </h2>
          <div className="flex gap-2">
            {workouts.length > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Dumbbell className="h-3 w-3" />
                {workouts.length}
              </Badge>
            )}
            {meals.length > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <UtensilsCrossed className="h-3 w-3" />
                {totalCalories} cal
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : workouts.length === 0 && meals.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No data for this day
        </div>
      ) : (
        <div className="space-y-6 px-4 pb-6">
          {workouts.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Dumbbell className="h-4 w-4" />
                Workouts
              </h3>
              <div className="flex flex-col">
                {workouts.map((ex) => (
                  <ExerciseCard
                    key={ex.id}
                    id={ex.id}
                    name={ex.name}
                    sets={ex.sets}
                  />
                ))}
              </div>
            </div>
          )}

          {meals.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <UtensilsCrossed className="h-4 w-4" />
                Meals
              </h3>
              <div className="flex flex-col">
                {meals.map((meal) => (
                  <MealCard key={meal.id} {...meal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
