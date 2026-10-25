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
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-sm">
         <Box className="border-border flex items-center justify-between border-b px-5 py-4">
            <Box className="flex items-center gap-3">
               <WorkOutlineOutlinedIcon
                  className="text-muted"
                  fontSize="small"
               />

               <Typography className="text-content text-[16px]! font-semibold!">
                  Recent Jobs
               </Typography>
            </Box>

            {showViewAll && (
               <Button
                  className="border-border! bg-surface! capitalize!"
                  color="primary"
                  size="small"
                  variant="outlined">
                  View all jobs →
               </Button>
            )}
         </Box>

         <RecentJobsTable jobs={jobs} />
      </Box>
   )
}

export default RecentJobs
