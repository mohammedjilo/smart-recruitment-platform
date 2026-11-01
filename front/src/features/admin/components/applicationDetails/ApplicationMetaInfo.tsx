import { Box, CircularProgress, Typography } from "@mui/material"

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import type { AdminApplicationDetails } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"
import { getMatchScoreColor } from "@/theme/tokens"
import CvDownloadButton from "@/components/common/CvDownloadButton"

type ApplicationMetaInfoProps = {
   application: AdminApplicationDetails
}

const ApplicationMetaInfo = ({ application }: ApplicationMetaInfoProps) => {
   return (
      <Box className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
         <MetaItem
            value={formatDate(application.createdAt, { format: "dateTime" })}
            icon={<CalendarMonthOutlinedIcon />}
            label="Applied On"
         />

         <MetaItem
            value={application.resumeType}
            icon={<DescriptionOutlinedIcon />}
            label="Resume Type"
         />

         <CvMetaItem
            applicationId={application.id}
            hasCv={application.hasCv}
         />

         <MatchScoreItem score={application.matchScore} />
      </Box>
   )
}

type MetaItemProps = {
   icon: React.ReactNode
   label: string
   value: string
}

const MetaItem = ({ icon, label, value }: MetaItemProps) => {
   return (
      <Box className="min-h-19.5 px-4 py-3 first:pl-0">
         <Box className="text-primary flex items-center gap-2">
            {icon}

            <Typography className="text-[10px]!">{label}</Typography>
         </Box>

         <Typography
            className="mt-2! text-xs! font-semibold!"
            color="textSecondary">
            {value}
         </Typography>
      </Box>
   )
}

type CvMetaItemProps = {
   hasCv: boolean
   applicationId: string
}

const CvMetaItem = ({ hasCv, applicationId }: CvMetaItemProps) => {
   return (
      <Box className="min-h-19.5 px-4 py-3">
         <Box className="text-primary flex items-center gap-2">
            <InsertDriveFileOutlinedIcon />

            <Typography className="text-[10px]!">CV File</Typography>
         </Box>

         {hasCv ? (
            <CvDownloadButton
               label="Download CV"
               target={{ scope: "admin-application", id: applicationId }}
            />
         ) : (
            <Typography
               className="mt-2! text-xs!"
               color="textSecondary">
               No CV uploaded
            </Typography>
         )}
      </Box>
   )
}

type MatchScoreItemProps = {
   score: number | null
}

const MatchScoreItem = ({ score }: MatchScoreItemProps) => {
   const normalizedScore = score === null ? 0 : Math.min(100, Math.max(0, score))

   return (
      <Box className="flex min-h-19.5 items-center gap-3 px-4 py-3">
         <Box className="relative">
            <CircularProgress
               value={normalizedScore}
               size={44}
               sx={{
                  color:
                     score === null ? "text.disabled" : getMatchScoreColor(score)
               }}
               thickness={4}
               variant="determinate"
            />

            <Box className="absolute inset-0 flex items-center justify-center">
               <Typography className="text-[10px]! font-bold!">
                  {score === null ? "—" : `${score}%`}
               </Typography>
            </Box>
         </Box>

         <Box>
            <Typography className="text-[10px]!">Match Score</Typography>

            <Typography
               className="mt-1! text-xs! font-semibold!"
               color="textSecondary">
               {score === null ? "Not available" : "Match score"}
            </Typography>
         </Box>
      </Box>
   )
}

export default ApplicationMetaInfo
