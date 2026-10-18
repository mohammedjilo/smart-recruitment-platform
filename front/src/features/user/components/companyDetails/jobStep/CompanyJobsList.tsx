import { Box, Typography } from "@mui/material"

import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import type { CompanyJob } from "@/types/user"
import CompanyJobRow from "./CompanyJobRow"

type Props = {
   jobs: CompanyJob[]
   hasFilters: boolean
}

const CompanyJobsList = ({ jobs, hasFilters }: Props) => {
   return (
      <Box className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
         {jobs.length === 0 ? (
            <Box className="flex min-h-87.5 flex-col items-center justify-center px-6 text-center">
               <WorkOutlineOutlinedIcon
                  className="mb-4 text-muted"
                  sx={{ fontSize: 44 }}
               />

               <Typography className="text-base! font-semibold! text-content">
                  {hasFilters ? "No matching jobs found" : "No jobs available"}
               </Typography>

               <Typography className="mt-2! text-sm!" color="textSecondary">
                  {hasFilters
                     ? "Try changing your search or job status filter."
                     : "This company does not have any jobs yet."}
               </Typography>
            </Box>
         ) : (
            jobs.map((job, index) => (
               <CompanyJobRow
                  key={job.id}
                  job={job}
                  isLast={index === jobs.length - 1}
               />
            ))
         )}
      </Box>
   )
}

export default CompanyJobsList
