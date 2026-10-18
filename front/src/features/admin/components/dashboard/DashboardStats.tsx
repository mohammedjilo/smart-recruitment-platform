import { Box } from "@mui/material"

import BusinessIcon from "@mui/icons-material/Business"
import PeopleIcon from "@mui/icons-material/People"
import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"

import StatCard from "./StatCard"
import type { AdminDashboardStats } from "@/types/admin"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"

interface DashboardStatsProps {
   stats: AdminDashboardStats
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
   const { hasPermission } = usePermissions()
   return (
      <Box className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
         {hasPermission(ADMIN_PERMISSIONS.VIEW_COMPANIES) && (
            <StatCard
               title="Total Companies"
               value={stats.totalCompanies}
               icon={BusinessIcon}
               iconColor="#5635E8"
               iconBackground="#EEEAFE"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_USERS) && (
            <StatCard
               title="Total Users"
               value={stats.totalUsers}
               icon={PeopleIcon}
               iconColor="#10B981"
               iconBackground="#DDF8ED"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_JOBS) && (
            <StatCard
               title="Total Jobs"
               value={stats.totalJobs}
               icon={WorkOutlinedIcon}
               iconColor="#2563EB"
               iconBackground="#E2ECFF"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_APPLICATIONS) && (
            <StatCard
               title="Total Applications"
               value={stats.totalApplications}
               icon={DescriptionOutlinedIcon}
               iconColor="#F59E0B"
               iconBackground="#FFF0D8"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_SUPPORT) && (
            <StatCard
               title="Open Support Tickets"
               value={stats.openSupportTickets}
               icon={SupportAgentOutlinedIcon}
               iconColor="#0F766E"
               iconBackground="#D9F5F1"
            />
         )}
      </Box>
   )
}
