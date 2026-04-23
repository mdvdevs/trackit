"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Loader2, Plus, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateHeader } from "@/components/date-header";
import { SearchableSelect } from "@/components/searchable-select";
import { ExerciseCard } from "@/components/exercise-card";
import { WorkoutTable } from "@/components/workout-table";
import {
  addWorkoutSet,
  getExerciseSuggestions,
  getWorkoutsByDate,
  deleteExercise,
} from "@/lib/actions/workout-actions";

export default function WorkoutPage() {
  const [date, setDate] = useState(new Date());
  const [exerciseName, setExerciseName] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savedExercises, setSavedExercises] = useState<
    {
      id: string;
      name: string;
      sets: { weight: number; unit: string; reps?: number }[];
    }[]
  >([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const dateStr = format(date, "yyyy-MM-dd");

  useEffect(() => {
    getExerciseSuggestions().then(setSuggestions);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getWorkoutsByDate(dateStr)
      .then((data) => {
        setSavedExercises(
          data.map((e) => ({
            id: e.id,
            name: e.name,
            sets: e.sets as { weight: number; unit: string; reps?: number }[],
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, [dateStr]);

  const canAdd = exerciseName.trim() && weight && reps;

  const handleAdd = () => {
    if (!canAdd) return;
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return;

    startTransition(async () => {
      await addWorkoutSet(exerciseName.trim(), w, unit, r, dateStr);
      setWeight("");
      setReps("");
      const fresh = await getWorkoutsByDate(dateStr);
      setSavedExercises(
        fresh.map((e) => ({
          id: e.id,
          name: e.name,
          sets: e.sets as { weight: number; unit: string; reps?: number }[],
        }))
      );
      if (!suggestions.some((s) => s.toLowerCase() === exerciseName.trim().toLowerCase())) {
        setSuggestions((prev) => [...prev, exerciseName.trim()].sort((a, b) => a.localeCompare(b)));
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteExercise(id);
      setSavedExercises((prev) => prev.filter((e) => e.id !== id));
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2 px-4 pt-4">
        <Dumbbell className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Workout Log</h1>
      </div>

      <DateHeader date={date} onDateChange={setDate} />

      <div className="px-4 space-y-3">
        <SearchableSelect
          options={suggestions}
          value={exerciseName}
          onChange={setExerciseName}
          placeholder="Search exercise..."
          emptyText="No exercises found"
        />

        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setUnit((u) => (u === "kg" ? "lbs" : "kg"))}
            className="shrink-0 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            {unit}
          </button>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="flex-1"
          />
        </div>

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
          {isPending ? "Adding..." : "Add Set"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : savedExercises.length > 0 ? (
        <div className="mt-6 space-y-6 px-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Exercises
            </h2>
            <div className="flex flex-col">
              {savedExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  id={ex.id}
                  name={ex.name}
                  sets={ex.sets}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Summary
            </h2>
            <WorkoutTable exercises={savedExercises} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No workouts logged for this day
          </p>
          <p className="text-xs text-muted-foreground/70">
            Search an exercise, enter weight & reps, then tap Add Set
          </p>
        </div>
      )}
    </div>
  );
}
