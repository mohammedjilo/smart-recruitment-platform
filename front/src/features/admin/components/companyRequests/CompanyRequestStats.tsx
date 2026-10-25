import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined"
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"

import { Box } from "@mui/material"
import CommonStatCard from "@/components/common/StatCard"
import type { CompanyRequestsStats } from "@/types/admin"

type CompanyRequestStatsProps = {
   stats: CompanyRequestsStats
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
         className="min-h-26"
         value={value}
         description={subtitle}
         icon={icon}
         iconClassName={iconClassName}
         label={title}
      />
   )
}

const CompanyRequestStats = ({ stats }: CompanyRequestStatsProps) => {
   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
         <StatCard
            value={stats.pending}
            icon={<AccessTimeOutlinedIcon className="text-[28px]!" />}
            iconClassName="bg-amber-50 text-amber-500"
            subtitle="Waiting for review"
            title="Pending Requests"
         />

         <StatCard
            value={stats.approved}
            icon={<CheckCircleOutlineOutlinedIcon className="text-[28px]!" />}
            iconClassName="bg-emerald-50 text-emerald-600"
            subtitle="Total approved"
            title="Approved Companies"
         />

         <StatCard
            value={stats.rejected}
            icon={<HighlightOffOutlinedIcon className="text-[28px]!" />}
            iconClassName="bg-red-50 text-red-600"
            subtitle="Total rejected"
            title="Rejected Companies"
         />

         <StatCard
            value={stats.totalCompanies}
            icon={<ApartmentOutlinedIcon className="text-[28px]!" />}
            iconClassName="bg-violet-50 text-violet-600"
            subtitle="All time"
            title="Total Companies"
         />
      </Box>
   )
}

export default CompanyRequestStats
