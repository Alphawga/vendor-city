"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validations";

type Result = { error: string } | { ok: true };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;
  return session.user.id;
}

export async function approveOnboarding(vendorId: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: "Unauthorized." };
  await db.vendor.update({
    where: { id: vendorId },
    data: { onboardingStatus: "APPROVED", rejectionReason: null },
  });
  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function rejectOnboarding(vendorId: string, reason: string): Promise<Result> {
  if (!(await requireAdmin())) return { error: "Unauthorized." };
  if (!reason.trim()) return { error: "A rejection reason is required." };
  await db.vendor.update({
    where: { id: vendorId },
    data: { onboardingStatus: "REJECTED", rejectionReason: reason.trim() },
  });
  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function reviewSubmission(
  submissionId: string,
  decision: "APPROVED" | "REJECTED",
  reason?: string,
): Promise<Result> {
  if (!(await requireAdmin())) return { error: "Unauthorized." };
  if (decision === "REJECTED" && !reason?.trim()) return { error: "A rejection reason is required." };

  const submission = await db.complianceSubmission.update({
    where: { id: submissionId },
    data: {
      status: decision,
      reviewedAt: new Date(),
      rejectionReason: decision === "REJECTED" ? reason!.trim() : null,
    },
    select: { vendorId: true },
  });

  revalidatePath(`/admin/vendors/${submission.vendorId}`);
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function createReview(vendorId: string, values: unknown): Promise<Result> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized." };

  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) return { error: "Please check the review form and try again." };

  const { qualityScore, timelinessScore, communicationScore, periodLabel, comments } = parsed.data;
  const overallScore = (qualityScore + timelinessScore + communicationScore) / 3;

  await db.performanceReview.create({
    data: {
      vendorId,
      periodLabel,
      qualityScore,
      timelinessScore,
      communicationScore,
      overallScore,
      comments: comments || null,
      reviewedBy: adminId,
    },
  });

  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin/performance");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
