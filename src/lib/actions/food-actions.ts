"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entries, meals } from "@/lib/db/schema";
import { parseMeals } from "@/lib/ai/parse-meals";
import { eq, and, desc } from "drizzle-orm";

function getMealLabel(
  time: string
): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "snack";
  return "dinner";
}

export async function saveFoodEntry(
  rawText: string,
  date: string,
  mealTime: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const parsed = await parseMeals(rawText);

    const [entry] = await db
      .insert(entries)
      .values({
        userId: session.user.id,
        rawText,
        type: "food",
        date,
      })
      .returning();

    const mealLabel = getMealLabel(mealTime);

    const mealRows = parsed.map((meal) => {
      const totalCalories = meal.items.reduce((sum, i) => sum + i.calories, 0);
      const totalProtein = meal.items.reduce((sum, i) => sum + i.protein, 0);
      const totalCarbs = meal.items.reduce((sum, i) => sum + i.carbs, 0);
      const totalFat = meal.items.reduce((sum, i) => sum + i.fat, 0);

      return {
        entryId: entry.id,
        userId: session.user!.id!,
        description: meal.description,
        items: meal.items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealTime,
        mealLabel,
        date,
      };
    });

    if (mealRows.length > 0) {
      await db.insert(meals).values(mealRows);
    }

    return { entry, meals: parsed };
  } catch (e) {
    const err = e as Error;
    console.error(
      JSON.stringify({
        tag: "trackit-saveFoodEntry-error",
        message: err?.message?.slice(0, 500),
        name: err?.name,
        t: Date.now(),
      })
    );
    throw e;
  }
}

export async function getMealsByDate(date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, session.user.id), eq(meals.date, date)))
    .orderBy(desc(meals.createdAt));

  return result;
}

export async function deleteMeal(mealId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, session.user.id)));
}
