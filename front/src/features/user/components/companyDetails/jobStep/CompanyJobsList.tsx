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
      <Box className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
         {jobs.length === 0 ? (
            <Box className="flex min-h-87.5 flex-col items-center justify-center px-6 text-center">
               <WorkOutlineOutlinedIcon className="text-muted mb-4 text-[44px]!" />

               <Typography className="text-content text-base! font-semibold!">
                  {hasFilters ? "No matching jobs found" : "No jobs available"}
               </Typography>

               <Typography
                  className="mt-2! text-sm!"
                  color="textSecondary">
                  {hasFilters
                     ? "Try changing your search."
                     : "This company does not have any jobs yet."}
               </Typography>
            </Box>
         ) : (
            jobs.map((job, index) => (
               <CompanyJobRow
                  key={job.id}
                  isLast={index === jobs.length - 1}
                  job={job}
               />
            ))
         )}
      </Box>
   )
}

export default CompanyJobsList
