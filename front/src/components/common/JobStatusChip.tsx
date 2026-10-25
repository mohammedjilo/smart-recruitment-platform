import { Chip } from "@mui/material"
import type { JobStatus } from "@/types/common/enums"
import { JOB_STATUS_CONFIG } from "@/types/common/status"

type JobStatusChipProps = {
   status: JobStatus
}

const JobStatusChip = ({ status }: JobStatusChipProps) => {
   const config = JOB_STATUS_CONFIG[status]

   return (
      <Chip
         className={`rounded-md! text-xs! font-bold! ${config.className}`}
         label={config.label}
         size="small"
      />
   )
}

export default JobStatusChip
