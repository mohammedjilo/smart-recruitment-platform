import type {
   ApplicationStatus,
   CompanyApprovalStatus,
   CompanyStatus,
   JobStatus,
   UserStatus
} from "@/types/common/enums"
import { statusToneStyles, type StatusTone } from "@/types/common/status"
import type { SupportTicketStatus } from "@/types/entities/support"

export { statusToneStyles, type StatusTone } from "@/types/common/status"

export const JOB_STATUS_TONE_MAP = {
   OPEN: "success",
   CLOSED: "neutral",
   DRAFT: "warning",
   EXPIRED: "error"
} as const satisfies Record<JobStatus, StatusTone>

export const APPLICATION_STATUS_TONE_MAP = {
   PENDING: "warning",
   REVIEWING: "info",
   SHORTLISTED: "cyan",
   INTERVIEW: "indigo",
   ACCEPTED: "success",
   REJECTED: "error",
   WITHDRAWN: "neutral"
} as const satisfies Record<ApplicationStatus, StatusTone>

export const USER_STATUS_TONE_MAP = {
   ACTIVE: "success",
   DEACTIVATED: "neutral"
} as const satisfies Record<UserStatus, StatusTone>

export const COMPANY_STATUS_TONE_MAP = {
   ACTIVE: "success",
   DEACTIVATED: "neutral"
} as const satisfies Record<CompanyStatus, StatusTone>

export const COMPANY_APPROVAL_STATUS_TONE_MAP = {
   PENDING: "warning",
   APPROVED: "success",
   REJECTED: "error"
} as const satisfies Record<CompanyApprovalStatus, StatusTone>

export const SUPPORT_TICKET_STATUS_TONE_MAP = {
   OPEN: "success",
   IN_PROGRESS: "info",
   WAITING_FOR_USER: "warning",
   RESOLVED: "success",
   CLOSED: "neutral"
} as const satisfies Record<SupportTicketStatus, StatusTone>

export const getStatusClassName = <T extends string>(
   status: T,
   map: Partial<Record<T, StatusTone>>
): string => {
   const tone = map[status] ?? "neutral"
   return statusToneStyles[tone]
}
