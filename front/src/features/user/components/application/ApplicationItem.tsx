import React from "react"
import { Box, Typography } from "@mui/material"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"

import type { ApplicationStatus } from "@/types/common/enums"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import formatCreatedAt from "@/utils/formatDate"
import { getMatchScoreColor } from "@/theme/tokens"

import type { UserApplicationListItem } from "@/types/api/applications"

type ApplicationDisplayData = Pick<UserApplicationListItem, "job">

export const getCompanyName = (application: ApplicationDisplayData) => {
   return application.job.company.companyName || "Company"
}

export const getCompanyLogo = (application: ApplicationDisplayData) => {
   return application.job.company.logoUrl
}

export const getJobTitle = (application: ApplicationDisplayData) => {
   return application.job.title || "Untitled Position"
}
interface CompanyLogoProps {
   application: UserApplicationListItem
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ application }) => {
   const logo = getCompanyLogo(application)

   if (logo) {
      return (
         <Box
            component="img"
            src={logo}
            alt={getCompanyName(application)}
            className="h-11 w-11 rounded-lg border border-[#E7EAF0] object-contain"
         />
      )
   }

   return (
      <Box className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E7EAF0] bg-[#F8FAFC]">
         <Typography className="text-lg font-bold text-[#6741E8]!">
            {getCompanyName(application).charAt(0).toUpperCase()}
         </Typography>
      </Box>
   )
}
interface MatchScoreProps {
   score?: number | null
   size?: number
}

export const MatchScore: React.FC<MatchScoreProps> = ({ score = 0, size = 52 }) => {
   const safeScore = Math.max(0, Math.min(100, Math.round(score ?? 0)))

   const radius = 18
   const circumference = 2 * Math.PI * radius
   const progress = circumference - (safeScore / 100) * circumference

   return (
      <Box
         className="relative flex shrink-0 items-center justify-center"
         sx={{
            width: size,
            height: size
         }}>
         <svg
            width={size}
            height={size}
            viewBox="0 0 44 44"
            className="-rotate-90">
            <circle
               cx="22"
               cy="22"
               r={radius}
               fill="none"
               stroke="#E5E7EB"
               strokeWidth="3.5"
            />

            <circle
               cx="22"
               cy="22"
               r={radius}
               fill="none"
               stroke={getMatchScoreColor(safeScore)}
               strokeWidth="3.5"
               strokeLinecap="round"
               strokeDasharray={circumference}
               strokeDashoffset={progress}
            />
         </svg>

         <Typography
            className="absolute! font-semibold! text-[#17213B]!"
            sx={{
               fontSize: size < 55 ? "11px" : "13px"
            }}>
            {safeScore}%
         </Typography>
      </Box>
   )
}
export const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
   return (
      <Box className="flex flex-1 justify-start">
         <ApplicationStatusChip status={status} />
      </Box>
   )
}
{
   /* <Chip
         size="small"
         icon={config.icon}
         label={config.label}
         className={`${config.className} font-medium!`}
         sx={{
            "& .MuiChip-icon": {
               fontSize: 15
            }
         }}
      /> */
}
const ApplicationItem = ({
   application,
   selected,
   handleSelectApplication
}: {
   application: UserApplicationListItem
   selected: boolean
   handleSelectApplication: (application: UserApplicationListItem) => void
}) => {
   return (
      <Box
         key={application.id}
         onClick={() => handleSelectApplication(application)}
         className={`mx-3 my-2 cursor-pointer rounded-lg border px-3 py-3 transition-all md:mx-3 ${
            selected
               ? "border-[#A78BFA]! bg-[#FCFAFF]!"
               : "border-[#EDF0F5]! hover:border-[#D8CCFF]! hover:bg-[#FCFAFF]!"
         } `}>
         {/* Desktop */}

         <Box className="hidden grid-cols-[minmax(220px,1.5fr)_120px_130px_130px_30px] items-center gap-4 md:grid">
            <Box className="flex min-w-0 items-center gap-3">
               <CompanyLogo application={application} />

               <Box className="min-w-0">
                  <Typography className="truncate! text-sm! font-semibold! text-[#17213B]!">
                     {getJobTitle(application)}
                  </Typography>

                  <Typography className="truncate! text-xs! text-[#64748B]!">
                     {getCompanyName(application)}
                  </Typography>
               </Box>
            </Box>

            <MatchScore score={application.matchScore} />

            <ApplicationStatusChip status={application.status} />

            <Typography className="text-sm! text-[#64748B]!">
               {formatCreatedAt(application.createdAt)}
            </Typography>

            <KeyboardArrowRightIcon className="text-[#94A3B8]!" />
         </Box>

         {/* Mobile */}

         <Box className="flex items-center gap-3 md:hidden">
            <CompanyLogo application={application} />

            <Box className="min-w-0 flex-1">
               <Typography className="truncate! text-sm! font-semibold! text-[#17213B]!">
                  {getJobTitle(application)}
               </Typography>

               <Typography className="truncate! text-xs! text-[#64748B]!">
                  {getCompanyName(application)}
               </Typography>

               <Box className="mt-2 flex flex-wrap items-center gap-2">
                  <ApplicationStatusChip status={application.status} />

                  <Typography className="text-xs! text-[#64748B]!">
                     {formatCreatedAt(application.createdAt)}
                  </Typography>
               </Box>
            </Box>

            <MatchScore
               score={application.matchScore}
               size={48}
            />
         </Box>
      </Box>
   )
}

export default ApplicationItem
