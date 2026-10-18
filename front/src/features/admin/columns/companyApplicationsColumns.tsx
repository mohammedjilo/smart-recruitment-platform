import { Box, Button, LinearProgress, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import ApplicationAvatar from "@/features/admin/components/applications/ApplicationAvatar"
import type { AdminCompanyApplication } from "@/types/admin"
import { getMatchScoreColor } from "@/theme/tokens"

type CompanyApplicationsColumnsArgs = {
   onView: (applicationId: string) => void
   formatDate: (date: string) => string
   formatTime: (date: string) => string
}

export const getCompanyApplicationsColumns = ({
   onView,
   formatDate,
   formatTime
}: CompanyApplicationsColumnsArgs): DataTableColumn<AdminCompanyApplication>[] => [
   {
      id: "applicant",
      header: "Applicant",
      render: application => (
         <Box className="flex items-center gap-3">
            <ApplicationAvatar
               firstName={application.user.firstName}
               lastName={application.user.lastName}
               profilePicUrl={application.user.profilePicUrl}
            />
            <Box>
               <Typography className="text-sm! font-semibold!">
                  {application.user.firstName} {application.user.lastName}
               </Typography>
               <Typography
                  className="mt-1! text-xs!"
                  color="textSecondary">
                  {application.user.email}
               </Typography>
            </Box>
         </Box>
      )
   },
   {
      id: "job",
      header: "Job",
      render: application => (
         <Typography className="text-sm! font-medium!">
            {application.job.title}
         </Typography>
      )
   },
   {
      id: "match-score",
      header: "Match Score",
      align: "center",
      render: application => {
         if (application.matchScore === null) {
            return (
               <Typography className="text-muted! text-center! text-sm!">—</Typography>
            )
         }

         return (
            <Box className="mx-auto w-18">
               <Typography className="mb-1! text-center! text-[11px]! font-bold!">
                  {application.matchScore}%
               </Typography>
               <LinearProgress
                  variant="determinate"
                  value={application.matchScore}
                  sx={{
                     "& .MuiLinearProgress-bar": {
                        backgroundColor: getMatchScoreColor(application.matchScore)
                     }
                  }}
                  className="h-1.5! rounded-full!"
               />
            </Box>
         )
      }
   },
   {
      id: "status",
      header: "Status",
      render: application => <ApplicationStatusChip status={application.status} />
   },
   {
      id: "applied-on",
      header: "Applied On",
      render: application => (
         <Box>
            <Typography className="text-sm! font-medium!">
               {formatDate(application.createdAt)}
            </Typography>
            <Typography
               className="mt-1! text-[11px]!"
               color="textSecondary">
               {formatTime(application.createdAt)}
            </Typography>
         </Box>
      )
   },
   {
      id: "actions",
      header: "Actions",
      align: "center",
      render: application => (
         <Button
            size="small"
            variant="text"
            color="primary"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={() => onView(application.id)}
            className="min-w-28! rounded-lg! text-xs! font-medium! normal-case!">
            View
         </Button>
      )
   }
]
