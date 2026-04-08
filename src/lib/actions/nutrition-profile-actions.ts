"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import type { ActivityLevel, NutritionGoal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  computeNutritionTargets,
  type NutritionTargets,
} from "@/lib/nutrition/compute-targets";

export type NutritionProfileDTO = {
  weightKg: number;
  heightCm: number;
  waistCm: number | null;
  sex: "male" | "female";
  age: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
};

export async function getNutritionProfileWithTargets(): Promise<{
  profile: NutritionProfileDTO | null;
  targets: NutritionTargets | null;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { profile: null, targets: null };
  }

  const [row] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id));

  if (!row) return { profile: null, targets: null };

  const profile: NutritionProfileDTO = {
    weightKg: row.weightKg,
    heightCm: row.heightCm,
    waistCm: row.waistCm ?? null,
    sex: row.sex,
    age: row.age,
    activityLevel: row.activityLevel,
    goal: row.goal,
  };

  return {
    profile,
    targets: computeNutritionTargets(profile),
  };
}

export async function saveNutritionProfile(data: {
  weightKg: number;
  heightCm: number;
  waistCm?: number | null;
  sex: "male" | "female";
  age: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const now = new Date();
  const waist =
    data.waistCm == null || Number.isNaN(data.waistCm)
      ? null
      : data.waistCm;

  const [existing] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id));

  if (existing) {
    await db
      .update(userProfiles)
      .set({
        weightKg: data.weightKg,
        heightCm: data.heightCm,
        waistCm: waist,
        sex: data.sex,
        age: data.age,
        activityLevel: data.activityLevel,
        goal: data.goal,
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, session.user.id));
  } else {
    await db.insert(userProfiles).values({
      userId: session.user.id,
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      waistCm: waist,
      sex: data.sex,
      age: data.age,
      activityLevel: data.activityLevel,
      goal: data.goal,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/onboarding");
  revalidatePath("/food");
  revalidatePath("/me");
  revalidatePath("/workout");
}
