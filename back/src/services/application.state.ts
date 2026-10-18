import { ApplicationStatus } from "@prisma/client";
import { AppError } from "../utils/appError";

/**
 * Company status changes and user withdrawals follow separate transition
 * rules; accepted applications may only leave that state through withdrawal.
 */

export const FINAL_APPLICATION_STATUSES = [
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
] as const;

const allowedTransitions: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  PENDING: [ApplicationStatus.REVIEWING, ApplicationStatus.REJECTED],
  REVIEWING: [
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
  ],
  SHORTLISTED: [
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ],
  INTERVIEW: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const WITHDRAWABLE_APPLICATION_STATUSES = [
  ApplicationStatus.PENDING,
  ApplicationStatus.REVIEWING,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.ACCEPTED,
] as const;

export const canWithdrawApplication = (status: ApplicationStatus) =>
  WITHDRAWABLE_APPLICATION_STATUSES.includes(
    status as (typeof WITHDRAWABLE_APPLICATION_STATUSES)[number]
  );

export const assertApplicationWithdrawal = (status: ApplicationStatus) => {
  if (canWithdrawApplication(status)) return;

  throw new AppError(
    `Application cannot be withdrawn from ${status}`,
    409,
    "INVALID_APPLICATION_STATUS_TRANSITION"
  );
};

export const isFinalApplicationStatus = (status: ApplicationStatus) =>
  FINAL_APPLICATION_STATUSES.includes(
    status as (typeof FINAL_APPLICATION_STATUSES)[number]
  );

export const assertApplicationTransition = (
  current: ApplicationStatus,
  next: ApplicationStatus
) => {
  /**
   * Enforces company-owned status transitions, keeping withdrawal exclusive
   * to the application's user.
   */
  if (current === next) return;
  if (isFinalApplicationStatus(current)) {
    throw new AppError(
      "Final application status cannot be changed",
      409,
      "APPLICATION_STATUS_FINAL"
    );
  }
  if (!allowedTransitions[current].includes(next)) {
    throw new AppError(
      `Application cannot transition from ${current} to ${next}`,
      409,
      "INVALID_APPLICATION_STATUS_TRANSITION"
    );
  }
};
