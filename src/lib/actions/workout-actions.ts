"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entries, exercises } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

const DEFAULT_EXERCISES = [
  "Bench Press",
  "Incline Bench Press",
  "Dumbbell Bench Press",
  "Overhead Press",
  "Dumbbell Shoulder Press",
  "Squat",
  "Front Squat",
  "Deadlift",
  "Romanian Deadlift",
  "Leg Press",
  "Leg Curl",
  "Leg Extension",
  "Barbell Row",
  "Dumbbell Row",
  "Lat Pulldown",
  "Pull Up",
  "Chin Up",
  "Cable Row",
  "Bicep Curl",
  "Hammer Curl",
  "Tricep Pushdown",
  "Skull Crusher",
  "Lateral Raise",
  "Face Pull",
  "Hip Thrust",
  "Calf Raise",
  "Plank",
  "Lunges",
  "Bulgarian Split Squat",
  "Cable Fly",
  "Chest Fly",
  "Shrugs",
];

function toNormalizedName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function getExerciseSuggestions() {
  const session = await auth();
  if (!session?.user?.id) return DEFAULT_EXERCISES;

  const rows = await db
    .selectDistinct({ name: exercises.name })
    .from(exercises)
    .where(eq(exercises.userId, session.user.id))
    .orderBy(exercises.name);

  const userNames = rows.map((r) => r.name);
  const merged = new Map<string, string>();

  for (const n of DEFAULT_EXERCISES) merged.set(n.toLowerCase(), n);
  for (const n of userNames) merged.set(n.toLowerCase(), n);

  return [...merged.values()].sort((a, b) => a.localeCompare(b));
}

export async function addWorkoutSet(
  name: string,
  weight: number,
  unit: "kg" | "lbs",
  reps: number,
  date: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const normalizedName = toNormalizedName(name);

  const existing = await db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.userId, session.user.id),
        eq(exercises.normalizedName, normalizedName),
        eq(exercises.date, date)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const row = existing[0];
    const currentSets = row.sets as { weight: number; unit: string; reps?: number }[];
    const newSets = [...currentSets, { weight, unit, reps }];

    await db
      .update(exercises)
      .set({ sets: newSets })
      .where(eq(exercises.id, row.id));
  } else {
    const [entry] = await db
      .insert(entries)
      .values({
        userId: session.user.id,
        rawText: `${name} ${weight}${unit} x ${reps}`,
        type: "workout",
        date,
      })
      .returning();

    await db.insert(exercises).values({
      entryId: entry.id,
      userId: session.user.id,
      name,
      normalizedName,
      sets: [{ weight, unit, reps }],
      date,
    });
  }

  revalidatePath("/workout");
}

export async function getWorkoutsByDate(date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.userId, session.user.id), eq(exercises.date, date)))
    .orderBy(desc(exercises.createdAt));

  return result;
}

export async function deleteExercise(exerciseId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(exercises)
    .where(
      and(eq(exercises.id, exerciseId), eq(exercises.userId, session.user.id))
    );

  revalidatePath("/workout");
}
