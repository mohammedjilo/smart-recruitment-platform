import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"

import { Box, Button, Typography } from "@mui/material"

import RecentJobsTable from "./RecentJobsTable"
import type { RecentJob } from "@/types/admin"

type Props = {
   jobs: RecentJob[]
   showViewAll?: boolean
}

const RecentJobs = ({ jobs, showViewAll = true }: Props) => {
   return (
      <Box className="bg-mui-blue-50 overflow-hidden rounded-xl border shadow-sm">
         <Box className="flex items-center justify-between border-b border-border px-5 py-4">
            <Box className="flex items-center gap-3">
               <WorkOutlineOutlinedIcon
                  fontSize="small"
                  className="text-muted"
               />

               <Typography className="text-[16px]! font-semibold! text-content">
                  Recent Jobs
               </Typography>
            </Box>

            {showViewAll && (
               <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  className="border-border! bg-surface! capitalize!">
                  View all jobs →
               </Button>
            )}
         </Box>

         <RecentJobsTable jobs={jobs} />
      </Box>
   )
}

export default RecentJobs
