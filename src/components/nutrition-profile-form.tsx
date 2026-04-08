"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  saveNutritionProfile,
  type NutritionProfileDTO,
} from "@/lib/actions/nutrition-profile-actions";
import type { ActivityLevel, NutritionGoal } from "@/lib/db/schema";
import {
  computeNutritionTargets,
  feetInchesToCm,
  cmToFeetInches,
} from "@/lib/nutrition/compute-targets";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Light (1–3 days/week)" },
  { value: "moderate", label: "Moderate (3–5 days/week)" },
  { value: "active", label: "Active (6–7 days/week)" },
  { value: "very_active", label: "Very active (athlete / physical job)" },
];

const GOAL_OPTIONS: { value: NutritionGoal; label: string }[] = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain_muscle", label: "Gain muscle" },
];

const selectClass = cn(
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "dark:bg-input/30"
);

type Props = {
  initial?: NutritionProfileDTO | null;
  /** After first onboarding save */
  successRedirect?: string;
  onSaved?: () => void;
};

export function NutritionProfileForm({
  initial,
  successRedirect,
  onSaved,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defFtIn = initial
    ? cmToFeetInches(initial.heightCm)
    : { feet: 5, inches: 10 };

  const [weightKg, setWeightKg] = useState(
    initial ? String(initial.weightKg) : "75"
  );
  const [feet, setFeet] = useState(String(defFtIn.feet));
  const [inches, setInches] = useState(String(defFtIn.inches));
  const [waistCm, setWaistCm] = useState(
    initial?.waistCm != null ? String(initial.waistCm) : ""
  );
  const [sex, setSex] = useState<"male" | "female">(initial?.sex ?? "male");
  const [age, setAge] = useState(String(initial?.age ?? 28));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initial?.activityLevel ?? "moderate"
  );
  const [goal, setGoal] = useState<NutritionGoal>(
    initial?.goal ?? "lose_weight"
  );

  const preview = computeNutritionTargets({
    weightKg: Math.max(parseFloat(weightKg) || 0, 1),
    heightCm: feetInchesToCm(
      Math.min(Math.max(parseInt(feet, 10) || 0, 3), 8),
      Math.min(Math.max(parseInt(inches, 10) || 0, 0), 11)
    ),
    sex,
    age: Math.min(Math.max(parseInt(age, 10) || 25, 13), 100),
    activityLevel,
    goal,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightKg);
    const ft = parseInt(feet, 10);
    const inc = parseInt(inches, 10);
    const a = parseInt(age, 10);

    if (!Number.isFinite(w) || w < 30 || w > 300) return;
    if (!Number.isFinite(ft) || ft < 3 || ft > 8) return;
    if (!Number.isFinite(inc) || inc < 0 || inc > 11) return;
    if (!Number.isFinite(a) || a < 13 || a > 100) return;

    const heightCm = feetInchesToCm(ft, inc);
    const waist =
      waistCm.trim() === ""
        ? null
        : (() => {
            const v = parseFloat(waistCm);
            return Number.isFinite(v) && v > 0 && v < 300 ? v : null;
          })();

    startTransition(async () => {
      await saveNutritionProfile({
        weightKg: w,
        heightCm,
        waistCm: waist,
        sex,
        age: a,
        activityLevel,
        goal,
      });
      if (successRedirect) router.push(successRedirect);
      else {
        onSaved?.();
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Weight (kg)
            </label>
            <Input
              type="number"
              step="0.1"
              min={30}
              max={300}
              required
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Waist (cm, optional)
            </label>
            <Input
              type="number"
              step="0.5"
              min={40}
              max={200}
              placeholder="—"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Height
          </label>
          <div className="flex gap-2">
            <select
              className={selectClass}
              value={feet}
              onChange={(e) => setFeet(e.target.value)}
              disabled={isPending}
              aria-label="Feet"
            >
              {[3, 4, 5, 6, 7, 8].map((f) => (
                <option key={f} value={f}>
                  {f}&apos; ft
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={inches}
              onChange={(e) => setInches(e.target.value)}
              disabled={isPending}
              aria-label="Inches"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {i} in
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Sex (for calorie estimate)
            </label>
            <select
              className={selectClass}
              value={sex}
              onChange={(e) =>
                setSex(e.target.value as "male" | "female")
              }
              disabled={isPending}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Age
            </label>
            <Input
              type="number"
              min={13}
              max={100}
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Activity level
          </label>
          <select
            className={selectClass}
            value={activityLevel}
            onChange={(e) =>
              setActivityLevel(e.target.value as ActivityLevel)
            }
            disabled={isPending}
          >
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Goal
          </label>
          <select
            className={selectClass}
            value={goal}
            onChange={(e) => setGoal(e.target.value as NutritionGoal)}
            disabled={isPending}
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">Estimated daily targets</p>
        <p className="mt-1 text-muted-foreground">
          About{" "}
          <span className="font-semibold text-foreground">
            {preview.dailyCalories} kcal
          </span>{" "}
          and{" "}
          <span className="font-semibold text-foreground">
            {preview.dailyProtein} g protein
          </span>
          . These update as you adjust the form.
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : initial ? (
          "Save goals & measurements"
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
}
