import type {
   JobStatus,
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
