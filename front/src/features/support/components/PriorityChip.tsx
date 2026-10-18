import { Chip } from "@mui/material"
import type { SupportPriority } from "@/types/entities/support"

type PriorityChipProps = {
   priority: SupportPriority
}

const priorityStyles: Record<SupportPriority, string> = {
   LOW: "bg-emerald-100! text-emerald-700!",
   MEDIUM: "bg-sky-100! text-sky-700!",
   HIGH: "bg-amber-100! text-amber-700!",
   URGENT: "bg-red-100! text-red-700!"
}

const priorityLabels: Record<SupportPriority, string> = {
   LOW: "Low",
   MEDIUM: "Medium",
   HIGH: "High",
   URGENT: "Urgent"
}

export default function PriorityChip({ priority }: PriorityChipProps) {
   return (
      <Chip
         label={priorityLabels[priority]}
         size="small"
         className={`rounded-full! text-xs! font-semibold! ${priorityStyles[priority]}`}
      />
   )
}
