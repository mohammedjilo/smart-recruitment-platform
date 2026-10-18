import { Box, Typography } from "@mui/material"
import type { JobStatus } from "@/types/job"
import { JOB_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"

type JobStatusChipProps = {
   status: JobStatus
}

const JobStatusChip = ({ status }: JobStatusChipProps) => {
   return (
      <Box
         className={`inline-flex rounded-md px-2.5 py-1 ${getStatusClassName(status, JOB_STATUS_TONE_MAP)} `}>
         <Typography className="text-[10px]! font-bold!">{status}</Typography>
      </Box>
   )
}

export default JobStatusChip
