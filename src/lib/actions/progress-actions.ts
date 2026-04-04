"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exercises, meals } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function getExerciseProgress(
  startDate: string,
  endDate: string,
  exerciseName?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const conditions = [
    eq(exercises.userId, session.user.id),
    gte(exercises.date, startDate),
    lte(exercises.date, endDate),
  ];

  if (exerciseName) {
    conditions.push(eq(exercises.normalizedName, exerciseName));
  }

  const result = await db
    .select()
    .from(exercises)
    .where(and(...conditions))
    .orderBy(exercises.date);

  return result;
}

export async function getNutritionProgress(
  startDate: string,
  endDate: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.userId, session.user.id),
        gte(meals.date, startDate),
        lte(meals.date, endDate)
      )
    )
    .orderBy(meals.date);

  return result;
}

export async function getUniqueExercises() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await db
    .select({
      name: exercises.name,
      normalizedName: exercises.normalizedName,
    })
    .from(exercises)
    .where(eq(exercises.userId, session.user.id))
    .groupBy(exercises.name, exercises.normalizedName)
    .orderBy(exercises.name);

  return result;
}

export async function getHistoryDates(startDate: string, endDate: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const workoutData = await db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.userId, session.user.id),
        gte(exercises.date, startDate),
        lte(exercises.date, endDate)
      )
    )
    .orderBy(desc(exercises.date));

  const mealData = await db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.userId, session.user.id),
        gte(meals.date, startDate),
        lte(meals.date, endDate)
      )
    )
    .orderBy(desc(meals.date));

  return { workouts: workoutData, meals: mealData };
}
