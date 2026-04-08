import type { ActivityLevel, NutritionGoal } from "@/lib/db/schema";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export type NutritionTargetInput = {
  weightKg: number;
  heightCm: number;
  sex: "male" | "female";
  age: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
};

export type NutritionTargets = {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;
};

/** Mifflin–St Jeor BMR (kcal/day). */
export function computeBmr(weightKg: number, heightCm: number, age: number, sex: "male" | "female") {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function computeNutritionTargets(input: NutritionTargetInput): NutritionTargets {
  const { weightKg, heightCm, age, sex, activityLevel, goal } = input;
  const bmr = computeBmr(weightKg, heightCm, age, sex);
  const tdee = bmr * ACTIVITY_FACTORS[activityLevel];

  let dailyCalories: number;
  switch (goal) {
    case "lose_weight":
      dailyCalories = Math.max(Math.round(tdee - 500), Math.round(bmr * 1.1));
      break;
    case "gain_muscle":
      dailyCalories = Math.round(tdee + 275);
      break;
    default:
      dailyCalories = Math.round(tdee);
  }

  let proteinPerKg: number;
  switch (goal) {
    case "lose_weight":
      proteinPerKg = 2.0;
      break;
    case "gain_muscle":
      proteinPerKg = 2.0;
      break;
    default:
      proteinPerKg = 1.6;
  }
  const dailyProtein = Math.round(weightKg * proteinPerKg * 10) / 10;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    dailyProtein,
  };
}

export function feetInchesToCm(feet: number, inches: number) {
  return (feet * 12 + inches) * 2.54;
}

export function cmToFeetInches(cm: number) {
  const totalIn = cm / 2.54;
  let feet = Math.floor(totalIn / 12);
  let inches = Math.round(totalIn - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}
