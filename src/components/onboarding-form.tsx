"use client";

import { NutritionProfileForm } from "@/components/nutrition-profile-form";

export function OnboardingForm() {
  return (
    <NutritionProfileForm successRedirect="/workout" />
  );
}
