import { Box, Typography } from "@mui/material"
import StatCard from "@/components/common/StatCard"

import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined"
import type { AdminUserStats } from "@/types/admin"

type UserStatisticsProps = {
   stats: AdminUserStats
}

const UserStatistics = ({ stats }: UserStatisticsProps) => {
   const statistics = [
      {
         label: "Applications",
         value: stats.applications
      },
      {
         label: "Saved Jobs",
         value: stats.savedJobs
      },
      {
         label: "Messages",
         value: stats.messages
      },
      {
         label: "Notifications",
         value: stats.notifications
      },
      {
         label: "Skills",
         value: stats.skills
      },
      {
         label: "Languages",
         value: stats.languages
      }
   ]

   return (
      <Box>
         <Box className="flex items-center gap-3">
            <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
               <BarChartOutlinedIcon />
            </Box>

            <Typography className="text-content text-base! font-semibold!">
               User Statistics
            </Typography>
         </Box>

         <Box className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {statistics.map(item => (
               <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  layout="vertical"
                  className="bg-bg! min-h-25 justify-center"
               />
            ))}
         </Box>
      </Box>
   )
}

export default UserStatistics
