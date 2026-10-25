import { Link } from "react-router-dom"
import SectionHeader from "./SectionHeader"
import type { GetDashboardCompanyResult } from "@/types/company"
import { Box, Typography } from "@mui/material"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import JobStatusChip from "@/components/common/JobStatusChip"

interface RecentJobsProps {
   jobs: GetDashboardCompanyResult["data"]["recentJobs"]
}
const RecentJobs = ({ jobs }: RecentJobsProps) => {
   return (
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
         <SectionHeader
            href="/company/jobs"
            title="Recent Jobs"
         />

         <Box className="mt-4 px-5 pb-4">
            {/* Header */}
            <Box className="grid grid-cols-[1.7fr_0.7fr_0.5fr] border-b px-0 pb-3 text-[12px] font-medium text-[#475467]">
               <Typography className="text-sm!">Job</Typography>
               <Typography className="text-sm!">Status</Typography>
               <Typography className="text-sm!">Applications</Typography>
            </Box>

            {jobs.length === 0 ? (
               <Box className="py-10 text-center text-sm text-[#667085]">
                  No recent jobs
               </Box>
            ) : (
               jobs.map(job => {
                  return (
                     <Box
                        className="grid min-h-18.5 grid-cols-[1.7fr_0.7fr_0.5fr] items-center border-b last:border-b-0"
                        key={job.id}>
                        {/* Job */}
                        <Box className="mr-2 min-w-0">
                           <Link
                              className="hover:text-mui-blue-900 block truncate text-[13px] font-semibold"
                              to={`/company/jobs/${job.id}/${job.slug}`}>
                              {job.title}
                           </Link>

                           <Box className="mt-1">
                              <EmploymentTypeChip employmentType={job.employmentType} />
                           </Box>
                        </Box>

                        {/* Status */}
                        <Box>
                           <JobStatusChip status={job.status} />
                        </Box>

                        {/* Applications */}
                        <Box className="text-right">
                           <Typography className="text-[13px]! font-medium!">
                              {job._count.applications}
                           </Typography>
                        </Box>
                     </Box>
                  )
               })
            )}
         </Box>
      </Box>
   )
}

export default RecentJobs
