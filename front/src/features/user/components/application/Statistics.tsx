import { Box } from "@mui/material"
import React, { useMemo } from "react"
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import type { UserApplicationListItem } from "@/types/api/applications"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"
import StatCard from "@/components/common/StatCard"

export type Application = UserApplicationListItem

interface StatisticCardProps {
   label: string
   value: number
   icon: React.ReactNode
   iconClass: string
}

const StatisticCard: React.FC<StatisticCardProps> = ({
   label,
   value,
   icon,
   iconClass
}) => {
   return (
      <StatCard
         value={value}
         icon={icon}
         iconClassName={iconClass}
         label={label}
      />
   )
}

const Statistics = ({ applications }: { applications: Application[] }) => {
   const pendingConfig = APPLICATION_STATUS_CONFIG.PENDING
   const reviewingConfig = APPLICATION_STATUS_CONFIG.REVIEWING
   const shortlistedConfig = APPLICATION_STATUS_CONFIG.SHORTLISTED
   const interviewConfig = APPLICATION_STATUS_CONFIG.INTERVIEW
   const acceptedConfig = APPLICATION_STATUS_CONFIG.ACCEPTED
   const rejectedConfig = APPLICATION_STATUS_CONFIG.REJECTED
   const withdrawnConfig = APPLICATION_STATUS_CONFIG.WITHDRAWN

   const PendingIcon = pendingConfig.icon
   const ReviewingIcon = reviewingConfig.icon
   const ShortlistedIcon = shortlistedConfig.icon
   const InterviewIcon = interviewConfig.icon
   const AcceptedIcon = acceptedConfig.icon
   const RejectedIcon = rejectedConfig.icon
   const WithdrawnIcon = withdrawnConfig.icon

   const statistics = useMemo(() => {
      return {
         total: applications.length,
         pending: applications.filter(item => item.status === "PENDING").length,
         inReview: applications.filter(item => item.status === "REVIEWING").length,
         shortlisted: applications.filter(item => item.status === "SHORTLISTED").length,
         interview: applications.filter(item => item.status === "INTERVIEW").length,
         accepted: applications.filter(item => item.status === "ACCEPTED").length,
         rejected: applications.filter(item => item.status === "REJECTED").length,
         withdrawn: applications.filter(item => item.status === "WITHDRAWN").length
      }
   }, [applications])

   return (
      <Box className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
         <StatisticCard
            value={statistics.total}
            icon={<WorkspacePremiumOutlinedIcon />}
            iconClass="bg-[#F3EFFF]! text-[#6741E8]!"
            label="Total Applications"
         />

         {/* PENDING */}
         <StatisticCard
            value={statistics.pending}
            icon={<PendingIcon />}
            iconClass={pendingConfig.className}
            label={pendingConfig.label}
         />

         {/* INREVIEW */}
         <StatisticCard
            value={statistics.inReview}
            icon={<ReviewingIcon />}
            iconClass={reviewingConfig.className}
            label={reviewingConfig.label}
         />

         {/* SHORTLISTED */}
         <StatisticCard
            value={statistics.shortlisted}
            icon={<ShortlistedIcon />}
            iconClass={shortlistedConfig.className}
            label={shortlistedConfig.label}
         />

         {/* INTERVIEW */}
         <StatisticCard
            value={statistics.interview}
            icon={<InterviewIcon />}
            iconClass={interviewConfig.className}
            label={interviewConfig.label}
         />

         {/* ACCEPTED */}
         <StatisticCard
            value={statistics.accepted}
            icon={<AcceptedIcon />}
            iconClass={acceptedConfig.className}
            label={acceptedConfig.label}
         />

         {/* REJECTED */}
         <StatisticCard
            value={statistics.rejected}
            icon={<RejectedIcon />}
            iconClass={rejectedConfig.className}
            label={rejectedConfig.label}
         />

         {/* WITHDRAWN */}
         <StatisticCard
            value={statistics.withdrawn}
            icon={<WithdrawnIcon />}
            iconClass={withdrawnConfig.className}
            label={withdrawnConfig.label}
         />
      </Box>
   )
}

export default Statistics
