import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { Box } from "@mui/material"
import StatCard from "@/components/common/StatCard"
import type { ApplicationStatus } from "@/types/admin"
import type { GetJobApplicationsByAdminResult } from "@/types/admin"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"

type JobApplicationsStatsProps = {
   stats: GetJobApplicationsByAdminResult["stats"]
}

const statuses: ApplicationStatus[] = [
   "PENDING",
   "REVIEWING",
   "SHORTLISTED",
   "INTERVIEW",
   "ACCEPTED",
   "REJECTED",
   "WITHDRAWN"
]

const JobApplicationsStats = ({ stats }: JobApplicationsStatsProps) => (
   <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
      <StatCard
         label="Total Applications"
         value={stats.totalCount}
         icon={<DescriptionOutlinedIcon />}
         iconClassName="bg-violet-50 text-violet-600"
         className="min-h-23 shadow-sm"
      />

      {statuses.map(status => {
         const config = APPLICATION_STATUS_CONFIG[status]
         const StatusIcon = config.icon

         return (
            <StatCard
               key={status}
               label={config.label}
               value={stats.statusCounts[status]}
               icon={<StatusIcon />}
               iconClassName={config.className}
               className="min-h-23 shadow-sm"
            />
         )
      })}
   </Box>
)

export default JobApplicationsStats
