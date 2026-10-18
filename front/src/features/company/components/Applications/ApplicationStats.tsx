import React from "react"

import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined"
import type { GetCompanyApplicationsResult } from "@/types/application"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"
import { Box } from "@mui/material"
import StatCard from "@/components/common/StatCard"

interface ApplicationStatsProps {
   stats: GetCompanyApplicationsResult["stats"]
}

const ApplicationStats: React.FC<ApplicationStatsProps> = ({
   stats: applicationStats
}) => {
   const pendingConfig = APPLICATION_STATUS_CONFIG.PENDING
   const reviewingConfig = APPLICATION_STATUS_CONFIG.REVIEWING
   const shortlistedConfig = APPLICATION_STATUS_CONFIG.SHORTLISTED
   const interviewConfig = APPLICATION_STATUS_CONFIG.INTERVIEW
   const rejectedConfig = APPLICATION_STATUS_CONFIG.REJECTED
   const PendingIcon = pendingConfig.icon
   const ReviewingIcon = reviewingConfig.icon
   const ShortlistedIcon = shortlistedConfig.icon
   const InterviewIcon = interviewConfig.icon
   const RejectedIcon = rejectedConfig.icon

   const statCards = [
      {
         label: "Applications",
         value: applicationStats.totalApplications,
         subtitle: "Across all jobs",
         icon: <AssignmentOutlined fontSize="small" />,
         iconClass: "bg-violet-50 text-violet-600"
      },
      {
         label: pendingConfig.label,
         value: applicationStats.pending,
         subtitle: `${getPercentage(applicationStats.pending, applicationStats.totalApplications)}% of total`,
         icon: <PendingIcon fontSize="small" />,
         iconClass: pendingConfig.className
      },
      {
         label: reviewingConfig.label,
         value: applicationStats.reviewing,
         subtitle: `${getPercentage(applicationStats.reviewing, applicationStats.totalApplications)}% of total`,
         icon: <ReviewingIcon fontSize="small" />,
         iconClass: reviewingConfig.className
      },
      {
         label: shortlistedConfig.label,
         value: applicationStats.shortlisted,
         subtitle: `${getPercentage(applicationStats.shortlisted, applicationStats.totalApplications)}% of total`,
         icon: <ShortlistedIcon fontSize="small" />,
         iconClass: shortlistedConfig.className
      },
      {
         label: interviewConfig.label,
         value: applicationStats.interview,
         subtitle: `${getPercentage(applicationStats.interview, applicationStats.totalApplications)}% of total`,
         icon: <InterviewIcon fontSize="small" />,
         iconClass: interviewConfig.className
      },
      {
         label: rejectedConfig.label,
         value: applicationStats.rejected,
         subtitle: `${getPercentage(applicationStats.rejected, applicationStats.totalApplications)}% of total`,
         icon: <RejectedIcon fontSize="small" />,
         iconClass: rejectedConfig.className
      }
   ]

   return (
      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
         {statCards.map(stat => (
            <StatCard
               key={stat.label}
               label={stat.label}
               value={stat.value}
               icon={stat.icon}
               iconClassName={stat.iconClass}
            />
         ))}
      </Box>
   )
}

const getPercentage = (count: number, total: number) => {
   if (!total) return 0

   return Math.round((count / total) * 100)
}

export default ApplicationStats
