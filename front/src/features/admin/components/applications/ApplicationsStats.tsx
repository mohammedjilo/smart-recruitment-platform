import { Box } from "@mui/material"
import StatCard from "@/components/common/StatCard"

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import type { StatusCounts } from "@/types/admin"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"

type ApplicationsStatsProps = {
   totalCount: number
   statusCounts: Partial<StatusCounts>
}

const ApplicationsStats = ({ totalCount, statusCounts }: ApplicationsStatsProps) => {
   const stats = [
      {
         key: "total-applications",
         label: "Total Applications",
         value: totalCount,
         icon: <DescriptionOutlinedIcon />,
         iconClass: "bg-violet-50 text-violet-600"
      },
      ...(
         [
            "PENDING",
            "REVIEWING",
            "SHORTLISTED",
            "INTERVIEW",
            "ACCEPTED",
            "REJECTED"
         ] as const
      ).map(status => {
         const config = APPLICATION_STATUS_CONFIG[status]
         const StatusIcon = config.icon

         return {
            key: status,
            label: config.label,
            value: statusCounts[status],
            icon: <StatusIcon />,
            iconClass: config.className
         }
      })
   ]

   return (
      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
         {stats.map(stat => {
            return (
               <StatCard
                  className="min-h-23 shadow-sm"
                  key={stat.key}
                  value={stat.value}
                  icon={stat.icon}
                  iconClassName={stat.iconClass}
                  label={stat.label}
               />
            )
         })}
      </Box>
   )
}

export default ApplicationsStats
