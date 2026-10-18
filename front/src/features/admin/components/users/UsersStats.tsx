import { Box } from "@mui/material"
import StatCard from "@/components/common/StatCard"

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined"
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined"
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined"
import type { AdminUsersStats } from "@/types/admin"

type UsersStatsProps = {
   stats: AdminUsersStats
}

const UsersStats = ({ stats }: UsersStatsProps) => {
   const statsItems = [
      {
         title: "Total Users",
         value: stats.totalUsers,
         icon: <GroupsOutlinedIcon />,
         iconClass: "bg-violet-50 text-violet-600"
      },
      {
         title: "Active Users",
         value: stats.activeUsers,
         icon: <PersonAddAltOutlinedIcon />,
         iconClass: "bg-emerald-50 text-emerald-600"
      },
      {
         title: "Deactivated Users",
         value: stats.inactiveUsers,
         icon: <PersonOffOutlinedIcon />,
         iconClass: "bg-orange-50 text-orange-500"
      }
   ]

   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
         {statsItems.map(item => (
            <StatCard
               key={item.title}
               label={item.title}
               value={item.value}
               icon={item.icon}
               iconClassName={item.iconClass}
               className="min-h-26 shadow-sm"
            />
         ))}
      </Box>
   )
}

export default UsersStats
