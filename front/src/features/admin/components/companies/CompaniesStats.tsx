import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined"
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"

import { Box } from "@mui/material"
import CommonStatCard from "@/components/common/StatCard"

import type { CompaniesStats as cs } from "@/types/admin"

type Props = {
   stats: cs
}

type StatCardProps = {
   title: string
   value: number
   subtitle: string
   icon: React.ReactNode
   iconClassName: string
}

const StatCard = ({ title, value, subtitle, icon, iconClassName }: StatCardProps) => {
   return (
      <CommonStatCard
         label={title}
         value={value}
         description={subtitle}
         icon={icon}
         iconClassName={iconClassName}
         className="min-h-27.5 shadow-sm"
      />
   )
}

const CompaniesStats = ({ stats }: Props) => {
   const activePercentage =
      stats.totalCompanies > 0
         ? ((stats.activeCompanies / stats.totalCompanies) * 100).toFixed(1)
         : "0"

   const pendingPercentage =
      stats.totalCompanies > 0
         ? ((stats.pendingApproval / stats.totalCompanies) * 100).toFixed(1)
         : "0"

   const rejectedPercentage =
      stats.totalCompanies > 0
         ? ((stats.rejectedCompanies / stats.totalCompanies) * 100).toFixed(1)
         : "0"

   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
         <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            subtitle="All companies"
            iconClassName="
               bg-violet-50 text-violet-600
            "
            icon={<ApartmentOutlinedIcon sx={{ fontSize: 29 }} />}
         />

         <StatCard
            title="Active Companies"
            value={stats.activeCompanies}
            subtitle={`${activePercentage}% of total`}
            iconClassName="
               bg-emerald-50 text-emerald-600
            "
            icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 29 }} />}
         />

         <StatCard
            title="Pending Approval"
            value={stats.pendingApproval}
            subtitle={`${pendingPercentage}% of total`}
            iconClassName="
               bg-amber-50 text-amber-600
            "
            icon={<AccessTimeOutlinedIcon sx={{ fontSize: 29 }} />}
         />

         <StatCard
            title="Rejected Companies"
            value={stats.rejectedCompanies}
            subtitle={`${rejectedPercentage}% of total`}
            iconClassName="
               bg-red-50 text-red-600
            "
            icon={<HighlightOffOutlinedIcon sx={{ fontSize: 29 }} />}
         />
      </Box>
   )
}

export default CompaniesStats
