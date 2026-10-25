import { Box, Button, LinearProgress, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import type { AdminApplication } from "@/types/admin"

import ApplicationAvatar from "@/features/admin/components/applications/ApplicationAvatar"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import { getMatchScoreColor } from "@/theme/tokens"

type GetAdminApplicationsColumnsArgs = {
   onView: (applicationId: string) => void
   formatDate: (date: string) => string
   formatTime: (date: string) => string
}

export const getAdminApplicationsColumns = ({
   onView,
   formatDate,
   formatTime
}: GetAdminApplicationsColumnsArgs): DataTableColumn<AdminApplication>[] => [
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
      id: "company",
      header: "Company",
      render: application => (
         <Box className="flex items-center gap-3">
            <ApplicationAvatar
               firstName={application.job.company.companyName}
               lastName=""
               profilePicUrl={application.job.company.logoUrl}
            />

            <Typography className="text-sm! font-medium!">
               {application.job.company.companyName}
            </Typography>
         </Box>
      )
   },
   {
      id: "status",
      header: "Status",
      render: application => <ApplicationStatusChip status={application.status} />
   },
   {
      id: "match-score",
      header: "Match Score",
      align: "center",
      render: application => {
         if (application.matchScore === null) {
            return (
               <Typography className="text-center! text-sm!" color="textSecondary">—</Typography>
            )
         }

         return (
            <Box className="mx-auto w-18">
               <Typography className="mb-1! text-center! text-sm! text-[11px]! font-bold!">
                  {application.matchScore}%
               </Typography>

               <LinearProgress
                  className="h-1.5! rounded-full!"
                  value={application.matchScore}
                  sx={{
                     "& .MuiLinearProgress-bar": {
                        backgroundColor: getMatchScoreColor(application.matchScore)
                     }
                  }}
                  variant="determinate"
               />
            </Box>
         )
      }
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
               className="mt-1! text-sm! text-[11px]!"
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
            className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!"
            color="primary"
            size="small"
            startIcon={<VisibilityOutlinedIcon />}
            variant="text"
            onClick={() => onView(application.id)}>
            View
         </Button>
      )
   }
]
