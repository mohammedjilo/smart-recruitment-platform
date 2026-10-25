import { Box, Button, IconButton, Typography } from "@mui/material"
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import JobStatusChip from "@/components/common/JobStatusChip"
import type { CompanyJob } from "@/types/JobsStep.types"
import { formatJobDeadline } from "@/utils/jobDeadline"

export type GetAdminCompanyJobsColumnsArgs = {
   onView: (job: CompanyJob) => void
   onOpenMenu: (event: React.MouseEvent<HTMLElement>, job: CompanyJob) => void
   formatDate: (date: string) => string
}

export const getAdminCompanyJobsColumns = ({
   onView,
   onOpenMenu,
   formatDate
}: GetAdminCompanyJobsColumnsArgs): DataTableColumn<CompanyJob>[] => [
   {
      id: "title",
      header: "Job Title",
      render: job => (
         <Typography className="text-sm! font-semibold!">{job.title}</Typography>
      )
   },
   {
      id: "employment-type",
      header: "Employment Type",
      render: job => <EmploymentTypeChip employmentType={job.employmentType} />
   },
   {
      id: "status",
      header: "Status",
      render: job => <JobStatusChip status={job.status} />
   },
   {
      id: "applications",
      header: "Applications",
      align: "center",
      render: job => (
         <Typography
            className="text-sm! font-medium!"
            color="textSecondary">
            {job._count.applications}
         </Typography>
      )
   },
   {
      id: "deadline",
      header: "Deadline",
      render: job => (
         <Typography
            className="text-xs!"
            color="textSecondary">
            {formatJobDeadline(job.deadline)}
         </Typography>
      )
   },
   {
      id: "posted-on",
      header: "Posted On",
      render: job => (
         <Typography
            className="text-xs!"
            color="textSecondary">
            {formatDate(job.createdAt)}
         </Typography>
      )
   },
   {
      id: "actions",
      header: "Actions",
      align: "center",
      render: job => (
         <Box className="flex justify-center gap-2">
            <Button
               className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!"
               color="primary"
               size="small"
               startIcon={<VisibilityOutlinedIcon />}
               variant="text"
               onClick={() => onView(job)}>
               View
            </Button>

            <IconButton
               className="border-border rounded-md border"
               size="small"
               onClick={event => onOpenMenu(event, job)}>
               <MoreHorizRoundedIcon fontSize="small" />
            </IconButton>
         </Box>
      )
   }
]
