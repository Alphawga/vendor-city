import type { OnboardingStatus, SubmissionStatus } from "@prisma/client";

type AnyStatus = OnboardingStatus | SubmissionStatus;

export const STATUS_CHART_COLORS: Record<AnyStatus, string> = {
  PENDING: "#d97706",
  PENDING_REVIEW: "#d97706",
  APPROVED: "#16a34a",
  REJECTED: "#ef4444",
  NOT_SUBMITTED: "#6b7280",
};
