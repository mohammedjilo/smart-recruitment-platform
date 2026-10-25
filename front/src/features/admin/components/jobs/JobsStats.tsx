import { Box } from "@mui/material"
import CommonStatCard from "@/components/common/StatCard"

import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined"
import type { AdminJobsStats } from "@/types/admin"

type JobsStatsProps = {
   stats?: AdminJobsStats
}

type StatCardProps = {
   label: string
   value: number
   icon: React.ReactNode
   iconClassName: string
   iconColorClassName: string
}

const StatCard = ({
   label,
   value,
   icon,
   iconClassName,
   iconColorClassName
}: StatCardProps) => {
   return (
      <CommonStatCard
         className="shadow-sm"
         value={value}
         icon={icon}
         iconClassName={`${iconClassName} ${iconColorClassName}`}
         label={label}
      />
   )
}

const JobsStats = ({ stats }: JobsStatsProps) => {
   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
         <StatCard
            value={stats?.totalJobs ?? 0}
            icon={<WorkOutlinedIcon />}
            iconClassName="bg-primary/10"
            iconColorClassName="text-primary"
            label="Total Jobs"
         />

         <StatCard
            value={stats?.openJobs ?? 0}
            icon={<LockOpenOutlinedIcon />}
            iconClassName="bg-emerald-50"
            iconColorClassName="text-emerald-600"
            label="Open Jobs"
         />

         <StatCard
            value={stats?.closedJobs ?? 0}
            icon={<LockOutlinedIcon />}
            iconClassName="bg-orange-50"
            iconColorClassName="text-orange-500"
            label="Closed Jobs"
         />

         <StatCard
            value={stats?.expiredJobs ?? 0}
            icon={<EventBusyOutlinedIcon />}
            iconClassName="bg-red-50"
            iconColorClassName="text-red-500"
            label="Expired Jobs"
         />
      </Box>
   )
}

export default JobsStats
