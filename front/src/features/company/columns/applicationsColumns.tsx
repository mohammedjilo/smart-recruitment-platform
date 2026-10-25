import { Avatar, Box, IconButton, Typography } from "@mui/material"
import RemoveRedEyeOutlined from "@mui/icons-material/RemoveRedEyeOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import type { CompanyApplication } from "@/types/application"

import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import MatchScore from "@/features/company/components/Applications/MatchScore"
import { formatDate as formatDateValue } from "@/utils/formatDate"

const formatDate = (date: string) => formatDateValue(date, { format: "dateTime" })

const ApplicationActionsCell = ({
   application,
   onViewApplication
}: {
   application: CompanyApplication
   onViewApplication: (application: CompanyApplication) => void
}) => {
   return (
      <Box className="contents">
         <Box className="flex justify-center gap-1">
            <IconButton
               className="border-border! border!"
               color="primary"
               size="small"
               onClick={() => onViewApplication(application)}>
               <RemoveRedEyeOutlined className="text-base!" />
            </IconButton>
         </Box>
      </Box>
   )
}

export const getCompanyApplicationsColumns = ({
   onViewApplication
}: {
   onViewApplication: (application: CompanyApplication) => void
}): DataTableColumn<CompanyApplication>[] => [
   {
      id: "candidate",
      header: "Candidate",
      width: 260,
      render: application => {
         const fullName = `${application.user.firstName} ${application.user.lastName}`

         return (
            <Box className="flex items-center gap-3">
               <Avatar
                  className="h-8.5! w-8.5! text-xs!"
                  src={application.user.profilePicUrl ?? undefined}>
                  {application.user.firstName?.charAt(0)}
               </Avatar>

               <Box>
                  <Typography className="line-clamp-1! text-sm! font-semibold!">
                     {fullName}
                  </Typography>

                  <Typography
                     className="mt-1! line-clamp-1! text-xs!"
                     color="textSecondary">
                     {application.user.email}
                  </Typography>
               </Box>
            </Box>
         )
      }
   },
   {
      id: "job",
      header: "Job",
      width: 250,
      render: application => (
         <Typography className="line-clamp-1! text-sm! font-medium!">
            {application.job.title}
         </Typography>
      )
   },
   {
      id: "status",
      header: "Status",
      width: 130,
      render: application => <ApplicationStatusChip status={application.status} />
   },
   {
      id: "match-score",
      header: "Match Score",
      width: 140,
      render: application => <MatchScore score={application.matchScore} />
   },
   {
      id: "applied-on",
      header: "Applied On",
      width: 170,
      render: application => (
         <Typography
            className="line-clamp-1! text-sm! whitespace-nowrap!"
            color="textSecondary">
            {formatDate(application.createdAt)}
         </Typography>
      )
   },
   {
      id: "actions",
      header: "Actions",
      align: "center",
      width: 120,
      render: application => (
         <ApplicationActionsCell
            application={application}
            onViewApplication={onViewApplication}
         />
      )
   }
]
