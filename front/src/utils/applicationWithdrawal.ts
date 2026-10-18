import type { ApplicationStatus } from "@/types/common/enums"

const withdrawableStatuses: readonly ApplicationStatus[] = [
   "PENDING",
   "REVIEWING",
   "SHORTLISTED",
   "INTERVIEW",
   "ACCEPTED"
]

export const canWithdrawApplication = (status: ApplicationStatus) =>
   withdrawableStatuses.includes(status)
