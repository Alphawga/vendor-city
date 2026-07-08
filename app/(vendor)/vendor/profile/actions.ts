"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validations";

export async function updateProfile(values: unknown): Promise<{ error: string } | { ok: true }> {
  const session = await auth();
  const vendorId = session?.user?.vendorId;
  if (!vendorId || session?.user?.role !== "VENDOR") return { error: "Unauthorized." };

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { error: "Please check the form and try again." };

  await db.vendor.update({
    where: { id: vendorId },
    data: parsed.data,
  });

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor/dashboard");
  return { ok: true };
}
