import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Calendar,
  TrendingUp,
  LogOut,
  ChevronRight,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileEditor } from "@/components/profile-editor";
import { NutritionProfileForm } from "@/components/nutrition-profile-form";
import { getNutritionProfileWithTargets } from "@/lib/actions/nutrition-profile-actions";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function MePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch latest user data from DB to ensure it's up to date
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  const name = dbUser?.name || session.user.name || "";
  const email = dbUser?.email || session.user.email || "";
  const image = dbUser?.image || session.user.image || null;

  const { profile, targets } = await getNutritionProfileWithTargets();
  if (!profile || !targets) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2 px-4 pt-4 pb-6">
        <User className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Me</h1>
      </div>

      <div className="px-4 space-y-6">
        <ProfileEditor 
          initialName={name} 
          initialEmail={email} 
          initialImage={image} 
        />

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Goals & measurements
          </div>
          <p className="text-xs text-muted-foreground">
            Current plan:{" "}
            <span className="font-medium text-foreground">
              {targets.dailyCalories} kcal / day
            </span>
            ,{" "}
            <span className="font-medium text-foreground">
              {targets.dailyProtein} g protein
            </span>
            . Estimates from your stats; not medical advice.
          </p>
          <NutritionProfileForm initial={profile} />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <Link href="/history" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">History</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          
          <Link href="/progress" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Progress</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="pt-4">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button variant="destructive" className="w-full gap-2" size="lg">
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}