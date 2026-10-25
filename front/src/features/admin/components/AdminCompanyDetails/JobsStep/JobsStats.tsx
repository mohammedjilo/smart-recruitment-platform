import { Box } from "@mui/material"
import CommonStatCard from "@/components/common/StatCard"

import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined"
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded"
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded"
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined"
import type { CompanyJobsStats } from "@/types/JobsStep.types"

type JobsStatsProps = {
   stats: CompanyJobsStats
}

type StatCardProps = {
   label: string
   value: number
   icon: React.ReactNode
   iconClassName: string
}

const StatCard = ({ label, value, icon, iconClassName }: StatCardProps) => {
   return (
      <CommonStatCard
         className="mt-2 shadow-sm"
         value={value}
         icon={icon}
         iconClassName={iconClassName}
         label={label}
      />
   )
}

const JobsStats = ({ stats }: JobsStatsProps) => {
   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <StatCard
            value={stats.totalJobs}
            icon={
               <WorkOutlinedIcon
                  className="text-primary"
                  fontSize="small"
               />
            }
            iconClassName="bg-primary/10"
            label="Total Jobs"
         />

         <StatCard
            value={stats.openJobs}
            icon={
               <PersonOutlineRoundedIcon
                  className="text-emerald-600"
                  fontSize="small"
               />
            }
            iconClassName="bg-emerald-50"
            label="Open Jobs"
         />

         <StatCard
            value={stats.closedJobs}
            icon={
               <AccessTimeRoundedIcon
                  className="text-orange-500"
                  fontSize="small"
               />
            }
            iconClassName="bg-orange-50"
            label="Closed Jobs"
         />

         <StatCard
            value={stats.expiredJobs}
            icon={
               <EventBusyOutlinedIcon
                  className="text-red-500"
                  fontSize="small"
               />
            }
            iconClassName="bg-red-50"
            label="Expired Jobs"
         />
      </Box>
   )
}

export default JobsStats
