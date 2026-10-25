import { Avatar, Box, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import type { GetDashboardCompanyResult } from "@/types/company"
import formatCreatedAt from "@/utils/formatDate"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import { MatchScore } from "@/features/user/components/application/ApplicationItem"
import SectionHeader from "./SectionHeader"

interface RecentApplicationsProps {
   applications: GetDashboardCompanyResult["data"]["recentApplications"]
}

const RecentApplications = ({ applications }: RecentApplicationsProps) => {
   return (
      <Box className="bg-surface overflow-hidden rounded-xl border shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
         <SectionHeader
            href="/company/applications"
            title="Recent Applications"
         />

         <Box
            className="responsive-scroll-region mt-4 overflow-x-auto"
            aria-label="Recent applications; scroll horizontally to see all columns"
            role="region"
            tabIndex={0}>
            <Box className="min-w-150 px-5 pb-5">
               {/* Header */}
               <Box className="grid grid-cols-[1.45fr_1.0fr_0.8fr_0.8fr_0.55fr] items-center border-b px-0 pb-3 text-[12px] font-medium text-[#475467]">
                  <Typography className="text-sm!">Candidate</Typography>
                  <Typography className="text-sm!">Job</Typography>
                  <Typography className="text-sm!">Match Score</Typography>
                  <Typography className="text-sm!">Status</Typography>
                  <Typography className="text-sm!">Applied At</Typography>
               </Box>

               {/* Rows */}
               {applications.length === 0 ? (
                  <Box className="py-10 text-center text-sm text-[#667085]">
                     No recent applications
                  </Box>
               ) : (
                  applications.map(application => {
                     return (
                        <Box
                           className="grid min-h-18 grid-cols-[1.45fr_1.0fr_0.8fr_0.8fr_0.55fr] items-center border-b last:border-b-0"
                           key={application.user.id + application.job.id}>
                           {/* Candidate */}
                           <Box className="flex min-w-0 items-center gap-3">
                              <Avatar
                                 className="h-9! w-9! bg-[#EDE9FE]! text-[13px]! text-[#5B35D5]!"
                                 src={application.user.profilePicUrl}
                              />

                              <Box className="min-w-0">
                                 <Typography className="truncate! text-[13px]! font-medium!">
                                    {application.user.firstName}{" "}
                                    {application.user.lastName}
                                 </Typography>

                                 <Typography
                                    className="truncate! text-[11px]!"
                                    color="textSecondary">
                                    {application.user.email}
                                 </Typography>
                              </Box>
                           </Box>

                           {/* Job */}
                           <Link
                              className="hover:text-mui-blue-900 truncate! pr-3! text-[13px]! font-medium"
                              to={`/company/jobs/${application.job.id}/${application.job.slug}`}>
                              {application.job.title}
                           </Link>

                           {/* Match Score */}
                           <Box className="flex items-center">
                              <MatchScore
                                 score={application.matchScore}
                                 size={45}
                              />
                           </Box>

                           {/* Status */}
                           <Box>
                              <ApplicationStatusChip status={application.status} />
                           </Box>

                           {/* Date */}
                           <Typography className="text-xs!">
                              {formatCreatedAt(application.createdAt)}
                           </Typography>
                        </Box>
                     )
                  })
               )}
            </Box>
         </Box>
      </Box>
   )
}
export default RecentApplications
