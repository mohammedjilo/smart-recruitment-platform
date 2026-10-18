import { Typography } from "@mui/material"
import type { SupportTicketStatus } from "@/types/entities/support"
import { SUPPORT_TICKET_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"

type BadgeKind = "audience" | "status"
type Audience = "USER" | "COMPANY"

type Props = {
   kind: BadgeKind
   value: SupportTicketStatus | Audience
}

const styles = {
   audience: {
      USER: "bg-cyan-100! text-cyan-700!",
      COMPANY: "bg-violet-100! text-violet-700!"
   },
   status: {
      OPEN: getStatusClassName("OPEN", SUPPORT_TICKET_STATUS_TONE_MAP),
      IN_PROGRESS: getStatusClassName("IN_PROGRESS", SUPPORT_TICKET_STATUS_TONE_MAP),
      WAITING_FOR_USER: getStatusClassName(
         "WAITING_FOR_USER",
         SUPPORT_TICKET_STATUS_TONE_MAP
      ),
      RESOLVED: getStatusClassName("RESOLVED", SUPPORT_TICKET_STATUS_TONE_MAP),
      CLOSED: getStatusClassName("CLOSED", SUPPORT_TICKET_STATUS_TONE_MAP)
   }
} as const

const labels = {
   USER: "User",
   COMPANY: "Company",
   OPEN: "Open",
   IN_PROGRESS: "In Progress",
   WAITING_FOR_USER: "Waiting for User",
   RESOLVED: "Resolved",
   CLOSED: "Closed"
} as const

export default function SupportBadge({ kind, value }: Props) {
   const colorClass = styles[kind][value as never]
   const label = labels[value as keyof typeof labels]

   return (
      <Typography
         className={`inline-flex! w-21! items-center! justify-center! rounded-full! px-2.5! py-1! text-xs! font-semibold! ${colorClass}`}>
         {label}
      </Typography>
   )
}
