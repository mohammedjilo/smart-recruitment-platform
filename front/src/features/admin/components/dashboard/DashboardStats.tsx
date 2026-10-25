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
               value={stats.totalCompanies}
               icon={BusinessIcon}
               iconBackground="#EEEAFE"
               iconColor="#5635E8"
               title="Total Companies"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_USERS) && (
            <StatCard
               value={stats.totalUsers}
               icon={PeopleIcon}
               iconBackground="#DDF8ED"
               iconColor="#10B981"
               title="Total Users"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_JOBS) && (
            <StatCard
               value={stats.totalJobs}
               icon={WorkOutlinedIcon}
               iconBackground="#E2ECFF"
               iconColor="#2563EB"
               title="Total Jobs"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_APPLICATIONS) && (
            <StatCard
               value={stats.totalApplications}
               icon={DescriptionOutlinedIcon}
               iconBackground="#FFF0D8"
               iconColor="#F59E0B"
               title="Total Applications"
            />
         )}

         {hasPermission(ADMIN_PERMISSIONS.VIEW_SUPPORT) && (
            <StatCard
               value={stats.openSupportTickets}
               icon={SupportAgentOutlinedIcon}
               iconBackground="#D9F5F1"
               iconColor="#0F766E"
               title="Open Support Tickets"
            />
         )}
      </Box>
   )
}
