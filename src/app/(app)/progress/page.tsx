"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Loader2, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ExerciseProgressChart,
  NutritionProgressChart,
} from "@/components/progress-chart";
import {
  getExerciseProgress,
  getNutritionProgress,
  getUniqueExercises,
} from "@/lib/actions/progress-actions";

type RangeKey = "7d" | "30d" | "90d";

const ranges: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 Days", days: 7 },
  { key: "30d", label: "30 Days", days: 30 },
  { key: "90d", label: "90 Days", days: 90 },
];

export default function ProgressPage() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseList, setExerciseList] = useState<
    { name: string; normalizedName: string }[]
  >([]);
  const [exerciseData, setExerciseData] = useState<
    { date: string; value: number }[]
  >([]);
  const [nutritionData, setNutritionData] = useState<
    { date: string; calories: number; protein: number; carbs: number; fat: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const days = ranges.find((r) => r.key === range)!.days;
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");

  useEffect(() => {
    getUniqueExercises().then((list) => {
      setExerciseList(list);
      if (list.length > 0 && !selectedExercise) {
        setSelectedExercise(list[0].normalizedName);
      }
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const exerciseFilter = selectedExercise || undefined;

    Promise.all([
      getExerciseProgress(startDate, endDate, exerciseFilter),
      getNutritionProgress(startDate, endDate),
    ]).then(([exData, nutData]) => {
      const exerciseByDate = new Map<string, number>();
      exData.forEach((ex) => {
        const sets = ex.sets as { weight: number; unit: string; reps?: number }[];
        const maxWeight = Math.max(...sets.map((s) => s.weight));
        const current = exerciseByDate.get(ex.date) || 0;
        exerciseByDate.set(ex.date, Math.max(current, maxWeight));
      });
      setExerciseData(
        Array.from(exerciseByDate.entries())
          .map(([date, value]) => ({ date, value }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );

      const nutritionByDate = new Map<
        string,
        { calories: number; protein: number; carbs: number; fat: number }
      >();
      nutData.forEach((m) => {
        const existing = nutritionByDate.get(m.date) || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
        nutritionByDate.set(m.date, {
          calories: existing.calories + m.totalCalories,
          protein: existing.protein + m.totalProtein,
          carbs: existing.carbs + m.totalCarbs,
          fat: existing.fat + m.totalFat,
        });
      });
      setNutritionData(
        Array.from(nutritionByDate.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );

      setIsLoading(false);
    });
  }, [range, selectedExercise, startDate, endDate]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2 px-4 pt-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Progress</h1>
      </div>

      <div className="flex gap-1 px-4 py-3">
        {ranges.map((r) => (
          <Button
            key={r.key}
            variant={range === r.key ? "default" : "outline"}
            size="sm"
            onClick={() => setRange(r.key)}
            className="flex-1 text-xs"
          >
            {r.label}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="workout" className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="workout" className="flex-1">
            Workout
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1">
            Nutrition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="mt-4 space-y-4">
          {exerciseList.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {exerciseList.map((ex) => (
                <Button
                  key={ex.normalizedName}
                  variant={
                    selectedExercise === ex.normalizedName
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedExercise(ex.normalizedName)}
                  className="whitespace-nowrap text-xs"
                >
                  {ex.name}
                </Button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : exerciseData.length > 0 ? (
            <ExerciseProgressChart
              title={`${
                exerciseList.find(
                  (e) => e.normalizedName === selectedExercise
                )?.name || "Exercise"
              } - Max Weight`}
              data={exerciseData}
            />
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No workout data for this period
            </div>
          )}
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : nutritionData.length > 0 ? (
            <NutritionProgressChart data={nutritionData} />
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No nutrition data for this period
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
