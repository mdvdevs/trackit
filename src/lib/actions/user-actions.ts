"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: { name?: string; email?: string; image?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const updateData: Partial<typeof users.$inferInsert> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.image !== undefined) updateData.image = data.image;

  if (Object.keys(updateData).length > 0) {
    await db.update(users).set(updateData).where(eq(users.id, session.user.id));
  }

  revalidatePath("/me");
}
