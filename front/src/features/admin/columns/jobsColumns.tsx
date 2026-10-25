import { Box, Button, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import type { AdminJob } from "@/types/admin"

import CompanyCell from "@/features/admin/components/jobs/CompanyCell"
import JobStatusChip from "@/components/common/JobStatusChip"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import { formatJobDeadline } from "@/utils/jobDeadline"

type GetAdminJobsColumnsArgs = {
   onView: (job: AdminJob) => void
   formatDate: (date: string) => string
}

export const getAdminJobsColumns = ({
   onView,
   formatDate
}: GetAdminJobsColumnsArgs): DataTableColumn<AdminJob>[] => [
   {
      id: "job-title",
      header: "Job Title",
      render: job => (
         <Box>
            <Typography className="text-sm! font-semibold!">{job.title}</Typography>
         </Box>
      )
   },
   {
      id: "company",
      header: "Company",
      render: job => (
         <CompanyCell
            companyName={job.company.companyName}
            logoUrl={job.company.logoUrl}
         />
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
            className="text-sm! font-medium! whitespace-nowrap!"
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
            className="text-sm! font-medium! whitespace-nowrap!"
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
            className="text-sm! font-medium! whitespace-nowrap!"
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
         <Button
            className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!"
            color="primary"
            size="small"
            startIcon={<VisibilityOutlinedIcon />}
            variant="text"
            onClick={() => onView(job)}>
            View
         </Button>
      )
   }
]
