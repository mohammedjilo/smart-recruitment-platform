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
         className="min-h-27.5 shadow-sm"
         value={value}
         description={subtitle}
         icon={icon}
         iconClassName={iconClassName}
         label={title}
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
            value={stats.totalCompanies}
            icon={<ApartmentOutlinedIcon className="text-[29px]!" />}
            iconClassName="
               bg-violet-50 text-violet-600
            "
            subtitle="All companies"
            title="Total Companies"
         />

         <StatCard
            value={stats.activeCompanies}
            icon={<CheckCircleOutlineOutlinedIcon className="text-[29px]!" />}
            iconClassName="
               bg-emerald-50 text-emerald-600
            "
            subtitle={`${activePercentage}% of total`}
            title="Active Companies"
         />

         <StatCard
            value={stats.pendingApproval}
            icon={<AccessTimeOutlinedIcon className="text-[29px]!" />}
            iconClassName="
               bg-amber-50 text-amber-600
            "
            subtitle={`${pendingPercentage}% of total`}
            title="Pending Approval"
         />

         <StatCard
            value={stats.rejectedCompanies}
            icon={<HighlightOffOutlinedIcon className="text-[29px]!" />}
            iconClassName="
               bg-red-50 text-red-600
            "
            subtitle={`${rejectedPercentage}% of total`}
            title="Rejected Companies"
         />
      </Box>
   )
}

export default CompaniesStats
