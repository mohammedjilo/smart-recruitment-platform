import { Box } from "@mui/material"
import type { Company } from "@/types/company"
import type { CompanyApprovalStatus, RecentJob } from "@/types/admin"
import CompanyAbout from "./CompanyAbout"
import CompanyStatistics from "./CompanyStatistics"
import RecentJobs from "./RecentJobs"
import CompanyAccountInformation from "./CompanyAccountInformation"

type Props = {
   company: Company & {
      approvalStatus: CompanyApprovalStatus
   }

   stats: {
      totalJobs: number
      totalApplications: number
   }

   recentJobs: RecentJob[]
}

const CompanyOverview = ({ company, stats, recentJobs }: Props) => {
   return (
      <Box className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.55fr_1fr]">
         {/* Left Side */}
         <Box className="space-y-3">
            <CompanyAbout description={company.description} />

            <CompanyStatistics stats={stats} />

            <RecentJobs jobs={recentJobs} />
         </Box>

         {/* Right Side */}
         <Box>
            <CompanyAccountInformation company={company} />
         </Box>
      </Box>
   )
}

export default CompanyOverview
