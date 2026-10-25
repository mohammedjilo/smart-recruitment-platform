import { Link } from "react-router-dom"
import SectionHeader from "./SectionHeader"
import type { GetDashboardCompanyResult } from "@/types/company"
import { Box, Typography } from "@mui/material"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"

interface TopJobsProps {
   jobs: GetDashboardCompanyResult["data"]["topJobs"]
}

const TopJobs = ({ jobs }: TopJobsProps) => {
   return (
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
         <SectionHeader
            href="/company/jobs"
            title="Most Applications"
         />

         <Box className="mt-4 px-5 pb-3">
            {jobs.length === 0 ? (
               <Box className="py-10 text-center text-sm text-[#667085]">
                  No jobs available
               </Box>
            ) : (
               jobs.map((job, index) => (
                  <Box
                     className="flex min-h-16 items-center border-b last:border-b-0"
                     key={job.id}>
                     {/* Rank */}
                     <Box className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-[#F3EFFF] text-[14px] font-semibold text-[#5B35D5]">
                        {index + 1}
                     </Box>

                     {/* Job Info */}
                     <Box className="ml-4 min-w-0 flex-1">
                        <Link
                           className="hover:text-mui-blue-900 block truncate text-[13px]! font-semibold hover:underline"
                           to={`/company/jobs/${job.id}/${job.slug}`}>
                           {job.title}
                        </Link>

                        <Box className="mt-1 flex items-center gap-2">
                           <EmploymentTypeChip employmentType={job.employmentType} />

                           <Typography
                              className="text-xs!"
                              color="textSecondary">
                              •
                           </Typography>

                           <Typography
                              className="text-xs!"
                              color="textSecondary">
                              Company Job
                           </Typography>
                        </Box>
                     </Box>

                     {/* Applications */}
                     <Box className="text-right">
                        <Typography className="text-[13px]! font-semibold">
                           {job._count.applications}
                        </Typography>

                        <Typography
                           className="mt-0.5 text-[11px]!"
                           color="textSecondary">
                           Applications
                        </Typography>
                     </Box>
                  </Box>
               ))
            )}
         </Box>
      </Box>
   )
}

export default TopJobs
