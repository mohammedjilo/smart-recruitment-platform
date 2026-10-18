import { Box, Typography } from "@mui/material"
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined"
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"

import type { CompanyJobsStats } from "@/types/user"
import StatCard from "@/components/common/StatCard"

type Props = {
   jobs: CompanyJobsStats
}

const CompanyStats = ({ jobs }: Props) => {
   const stats = [
      {
         label: "Total Jobs",
         value: jobs.total,
         icon: <BusinessCenterOutlinedIcon className="text-violet-600" />,
         iconBackground: "bg-violet-50"
      },
      {
         label: "Open Jobs",
         value: jobs.open,
         icon: <FolderOpenOutlinedIcon className="text-emerald-600" />,
         iconBackground: "bg-emerald-50"
      },
      {
         label: "Expired Jobs",
         value: jobs.expired,
         icon: <EventBusyOutlinedIcon className="text-amber-600" />,
         iconBackground: "bg-amber-50"
      },
      {
         label: "Closed Jobs",
         value: jobs.closed,
         icon: <LockOutlinedIcon className="text-red-500" />,
         iconBackground: "bg-red-50"
      }
   ]

   return (
      <Box className="h-full">
         <Box className="flex items-center gap-4">
            <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
               <BusinessCenterOutlinedIcon className="text-violet-600" />
            </Box>

            <Typography className="text-content text-base! font-bold!">
               Company Stats
            </Typography>
         </Box>

         <Box className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(stat => (
               <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  iconClassName={stat.iconBackground}
                  layout="vertical"
                  className="min-h-32.5 justify-center"
               />
            ))}
         </Box>
      </Box>
   )
}

export default CompanyStats
