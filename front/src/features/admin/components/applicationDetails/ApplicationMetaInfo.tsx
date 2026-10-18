import { Box, Button, CircularProgress, Typography } from "@mui/material"

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined"
import type { AdminApplicationDetails } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"
import { getMatchScoreColor } from "@/theme/tokens"

type ApplicationMetaInfoProps = {
   application: AdminApplicationDetails
}

const ApplicationMetaInfo = ({ application }: ApplicationMetaInfoProps) => {
   return (
      <Box className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
         <MetaItem
            icon={<CalendarMonthOutlinedIcon />}
            label="Applied On"
            value={formatDate(application.createdAt, { format: "dateTime" })}
         />

         <MetaItem
            icon={<DescriptionOutlinedIcon />}
            label="Resume Type"
            value={application.resumeType}
         />

         <CvMetaItem
            cvUrl={application.cvUrl}
            cvId={application.cvId}
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
   cvUrl: string | null
   cvId: string | null
}

const CvMetaItem = ({ cvUrl, cvId }: CvMetaItemProps) => {
   return (
      <Box className="min-h-19.5 px-4 py-3">
         <Box className="text-primary flex items-center gap-2">
            <InsertDriveFileOutlinedIcon />

            <Typography className="text-[10px]!">CV File</Typography>
         </Box>

         {cvUrl ? (
            <Button
               size="small"
               endIcon={<DownloadOutlinedIcon />}
               onClick={() => window.open(cvUrl, "_blank", "noopener,noreferrer")}
               className="mt-1! min-w-0! px-2! normal-case!">
               Download CV
            </Button>
         ) : (
            <Typography
               className="mt-2! text-xs!"
               color="textSecondary">
               {cvId ?? "No CV uploaded"}
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
               variant="determinate"
               value={normalizedScore}
               size={44}
               thickness={4}
               sx={{
                  color:
                     score === null ? "text.disabled" : getMatchScoreColor(score)
               }}
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
