import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BottomNav } from "@/components/bottom-nav";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const [profile] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile) redirect("/onboarding");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
