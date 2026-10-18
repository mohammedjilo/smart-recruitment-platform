import { Box, Typography } from "@mui/material"

import type { RecentJob } from "@/types/admin"
import formatCreatedAt from "@/utils/formatDate"
import JobStatusChip from "@/components/common/JobStatusChip"

type Props = {
   jobs: RecentJob[]
}

const RecentJobsTable = ({ jobs }: Props) => {
   if (jobs.length === 0) {
      return (
         <Box className="flex min-h-45 items-center justify-center">
            <Typography className="text-sm text-muted">No jobs found.</Typography>
         </Box>
      )
   }

   return (
      <Box
         className="responsive-scroll-region overflow-x-auto"
         role="region"
         aria-label="Recent jobs; scroll horizontally to see all columns"
         tabIndex={0}>
         <Box className="min-w-162.5">
            {/* Table Header */}
            <Box className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-4 border-b border-border bg-bg px-5 py-3">
               <Typography className="text-xs! font-semibold! text-muted">
                  Job Title
               </Typography>

               <Typography className="text-xs! font-semibold! text-muted">
                  Status
               </Typography>

               <Typography className="text-xs! font-semibold! text-muted">
                  Applications
               </Typography>

               <Typography className="text-xs! font-semibold! text-muted">
                  Posted On
               </Typography>
            </Box>

            {/* Table Rows */}
            {jobs.map(job => (
               <Box
                  key={job.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr] gap-4 border-b px-5 py-4 last:border-b-0">
                  <Typography className="truncate! text-sm! font-medium!">
                     {job.title}
                  </Typography>

                  <JobStatusChip status={job.status} />

                  <Typography className="text-sm!">{job._count.applications}</Typography>

                  <Typography className="text-sm!">
                     {formatCreatedAt(job.createdAt)}
                  </Typography>
               </Box>
            ))}
         </Box>
      </Box>
   )
}

export default RecentJobsTable
