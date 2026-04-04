"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entries, exercises } from "@/lib/db/schema";
import { parseExercises } from "@/lib/ai/parse-exercises";
import { eq, and, desc } from "drizzle-orm";

export async function saveWorkoutEntry(rawText: string, date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = await parseExercises(rawText);

  const [entry] = await db
    .insert(entries)
    .values({
      userId: session.user.id,
      rawText,
      type: "workout",
      date,
    })
    .returning();

  const exerciseRows = parsed.map((ex) => ({
    entryId: entry.id,
    userId: session.user!.id!,
    name: ex.name,
    normalizedName: ex.normalizedName,
    sets: ex.sets,
    date,
  }));

  if (exerciseRows.length > 0) {
    await db.insert(exercises).values(exerciseRows);
  }

  return { entry, exercises: parsed };
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
}
