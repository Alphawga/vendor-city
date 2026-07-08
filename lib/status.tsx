import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OnboardingStatus, SubmissionStatus } from "@prisma/client";

type AnyStatus = OnboardingStatus | SubmissionStatus;

export const LABELS: Record<AnyStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NOT_SUBMITTED: "Not submitted",
  PENDING_REVIEW: "Pending review",
};

const CLASSES: Record<AnyStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  PENDING_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  NOT_SUBMITTED: "bg-gray-100 text-gray-700 border-gray-200",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", CLASSES[status])}>
      {LABELS[status]}
    </Badge>
  );
}

const DAY = 1000 * 60 * 60 * 24;

export type ExpiryState = "none" | "ok" | "soon" | "expired";

export function expiryState(expiryDate: Date | null | undefined): ExpiryState {
  if (!expiryDate) return "none";
  const diff = (new Date(expiryDate).getTime() - Date.now()) / DAY;
  if (diff < 0) return "expired";
  if (diff <= 30) return "soon";
  return "ok";
}

export function ExpiryFlag({ expiryDate }: { expiryDate: Date | null | undefined }) {
  const state = expiryState(expiryDate);
  if (state === "none") return <span className="text-muted-foreground">—</span>;

  const label = new Date(expiryDate!).toLocaleDateString();
  const cls =
    state === "expired"
      ? "text-red-600 font-medium"
      : state === "soon"
        ? "text-amber-600 font-medium"
        : "text-foreground";

  return (
    <span className={cls}>
      {label}
      {state === "expired" && " (expired)"}
      {state === "soon" && " (expiring soon)"}
    </span>
  );
}
