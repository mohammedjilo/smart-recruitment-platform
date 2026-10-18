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
         label={title}
         value={value}
         description={subtitle}
         icon={icon}
         iconClassName={iconClassName}
         className="min-h-26"
      />
   )
}

const CompanyRequestStats = ({ stats }: CompanyRequestStatsProps) => {
   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
         <StatCard
            title="Pending Requests"
            value={stats.pending}
            subtitle="Waiting for review"
            iconClassName="bg-amber-50 text-amber-500"
            icon={<AccessTimeOutlinedIcon sx={{ fontSize: 28 }} />}
         />

         <StatCard
            title="Approved Companies"
            value={stats.approved}
            subtitle="Total approved"
            iconClassName="bg-emerald-50 text-emerald-600"
            icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 28 }} />}
         />

         <StatCard
            title="Rejected Companies"
            value={stats.rejected}
            subtitle="Total rejected"
            iconClassName="bg-red-50 text-red-600"
            icon={<HighlightOffOutlinedIcon sx={{ fontSize: 28 }} />}
         />

         <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            subtitle="All time"
            iconClassName="bg-violet-50 text-violet-600"
            icon={<ApartmentOutlinedIcon sx={{ fontSize: 28 }} />}
         />
      </Box>
   )
}

export default CompanyRequestStats
