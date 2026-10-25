import { Chip } from "@mui/material"
import type { SupportTicketStatus } from "@/types/entities/support"
import { SUPPORT_TICKET_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"

type ChipKind = "audience" | "status"
type Audience = "USER" | "COMPANY"

type Props = {
   kind: ChipKind
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

export default function SupportChip({ kind, value }: Props) {
   const colorClass = styles[kind][value as never]
   const label = labels[value as keyof typeof labels]

   return (
      <Chip
         className={`h-auto! min-h-6! w-22! rounded-full! text-xs! font-semibold! [&_.MuiChip-label]:py-1! [&_.MuiChip-label]:text-center! [&_.MuiChip-label]:leading-tight! [&_.MuiChip-label]:whitespace-normal! ${colorClass}`}
         label={label}
         size="small"
      />
   )
}
