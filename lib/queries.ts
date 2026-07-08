import { db } from "@/lib/db";
import { COMPLIANCE_ITEMS } from "@/lib/compliance-items";
import type { ComplianceItem, ComplianceSubmission } from "@prisma/client";

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
