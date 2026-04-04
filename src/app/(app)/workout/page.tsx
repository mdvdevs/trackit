"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Loader2, Save, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateHeader } from "@/components/date-header";
import { NoteEditor } from "@/components/note-editor";
import { ExerciseCard } from "@/components/exercise-card";
import { WorkoutTable } from "@/components/workout-table";
import {
  saveWorkoutEntry,
  getWorkoutsByDate,
  deleteExercise,
} from "@/lib/actions/workout-actions";

export default function WorkoutPage() {
  const [date, setDate] = useState(new Date());
  const [text, setText] = useState("");
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

  const handleSave = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      const result = await saveWorkoutEntry(text.trim(), dateStr);
      setSavedExercises((prev) => [
        ...result.exercises.map((e, i) => ({
          id: `new-${Date.now()}-${i}`,
          ...e,
        })),
        ...prev,
      ]);
      setText("");
      const fresh = await getWorkoutsByDate(dateStr);
      setSavedExercises(
        fresh.map((e) => ({
          id: e.id,
          name: e.name,
          sets: e.sets as { weight: number; unit: string; reps?: number }[],
        }))
      );
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

      <div className="px-4">
        <div className="rounded-xl border bg-card">
          <NoteEditor
            value={text}
            onChange={setText}
            placeholder={`Type your workout...\n\nBench press - 40kg, 45kg, 50kg, 60kg\nIncline dumbbell press - 20kg x 10, 22kg x 8\nSquat - 80kg x 5, 90kg x 5, 100kg x 3`}
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
      ) : savedExercises.length > 0 ? (
        <div className="mt-6 space-y-6 px-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Exercises
            </h2>
            <div className="space-y-2">
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
            Type your exercises above and hit Save
          </p>
        </div>
      )}
    </div>
  );
}
