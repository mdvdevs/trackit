import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Dumbbell } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const [existing] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (existing) redirect("/workout");

  return (
    <div className="mx-auto max-w-lg px-4 pb-12 pt-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Dumbbell className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Set up your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We use your weight, height, activity, and goal to estimate daily calories
          and protein. You can change this anytime in Me.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
