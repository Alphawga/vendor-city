import { db } from "@/lib/db";
import { COMPLIANCE_ITEMS } from "@/lib/compliance-items";
import type { ComplianceItem, ComplianceSubmission, OnboardingStatus, SubmissionStatus } from "@prisma/client";

export const TOTAL_ITEMS = COMPLIANCE_ITEMS.length;

export type ItemWithSubmission = ComplianceItem & {
  submission: ComplianceSubmission | null;
};

/** Merge the fixed compliance item list with a vendor's submissions. */
export async function getComplianceForVendor(vendorId: string): Promise<ItemWithSubmission[]> {
  const [items, submissions] = await Promise.all([
    db.complianceItem.findMany({ orderBy: { name: "asc" } }),
    db.complianceSubmission.findMany({ where: { vendorId } }),
  ]);
  const byItem = new Map(submissions.map((s) => [s.complianceItemId, s]));
  return items.map((item) => ({ ...item, submission: byItem.get(item.id) ?? null }));
}

export function complianceStats(items: ItemWithSubmission[]) {
  let approved = 0;
  let pending = 0;
  let expired = 0;
  const now = Date.now();
  for (const { submission } of items) {
    if (submission?.status === "APPROVED") approved++;
    if (submission?.status === "PENDING_REVIEW") pending++;
    if (submission?.expiryDate && new Date(submission.expiryDate).getTime() < now) expired++;
  }
  return { approved, pending, expired, total: items.length };
}

export function completionPct(approved: number, total: number) {
  return total === 0 ? 0 : Math.round((approved / total) * 100);
}

export async function onboardingStatusBreakdown(): Promise<{ status: OnboardingStatus; count: number }[]> {
  const rows = await db.vendor.groupBy({ by: ["onboardingStatus"], _count: true });
  return rows.map((r) => ({ status: r.onboardingStatus, count: r._count }));
}

export async function submissionStatusBreakdown(): Promise<{ status: SubmissionStatus; count: number }[]> {
  const rows = await db.complianceSubmission.groupBy({ by: ["status"], _count: true });
  return rows.map((r) => ({ status: r.status, count: r._count }));
}

export async function complianceCompletionByItem(): Promise<
  { name: string; approvedCount: number; totalVendors: number }[]
> {
  const [items, totalVendors, approvedGroups] = await Promise.all([
    db.complianceItem.findMany({ orderBy: { name: "asc" } }),
    db.vendor.count(),
    db.complianceSubmission.groupBy({
      by: ["complianceItemId"],
      where: { status: "APPROVED" },
      _count: true,
    }),
  ]);
  const byItem = new Map(approvedGroups.map((g) => [g.complianceItemId, g._count]));
  return items.map((item) => ({
    name: item.name,
    approvedCount: byItem.get(item.id) ?? 0,
    totalVendors,
  }));
}

export async function orgPerformanceTrend(): Promise<{ period: string; score: number }[]> {
  const reviews = await db.performanceReview.findMany({
    orderBy: { createdAt: "asc" },
    select: { periodLabel: true, overallScore: true },
  });
  const byPeriod = new Map<string, { sum: number; count: number }>();
  for (const r of reviews) {
    const entry = byPeriod.get(r.periodLabel) ?? { sum: 0, count: 0 };
    entry.sum += r.overallScore;
    entry.count += 1;
    byPeriod.set(r.periodLabel, entry);
  }
  return Array.from(byPeriod.entries()).map(([period, { sum, count }]) => ({
    period,
    score: sum / count,
  }));
}
