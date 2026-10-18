import { Box, Typography } from "@mui/material"

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { AdminJobDetails } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"
import { formatJobDeadline } from "@/utils/jobDeadline"

type JobInformationProps = {
   job: AdminJobDetails
}

const formatSalary = (salary: number | null) => {
   if (salary === null) {
      return "Not specified"
   }

   return `$${salary.toLocaleString()}`
}

const JobInformation = ({ job }: JobInformationProps) => {
   return (
      <Box className="bg-surface rounded-xl border p-6">
         <Box className="flex items-center gap-3">
            <AssignmentOutlinedIcon
               className="text-primary"
               fontSize="small"
            />

            <Typography className="text-content text-sm! font-bold!">
               Job Details
            </Typography>
         </Box>

         <Box className="mt-6 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <DetailRow
               label="Employment Type"
               value={<EmploymentTypeChip employmentType={job.employmentType} />}
            />

            <DetailRow
               label="Deadline"
               value={formatJobDeadline(job.deadline)}
            />

            <DetailRow
               label="Experience Required"
               value={`${job.experienceRequired} years`}
            />

            <DetailRow
               label="Posted On"
               value={formatDate(job.createdAt)}
            />

            <DetailRow
               label="Salary"
               value={formatSalary(job.salary)}
            />

            <DetailRow
               label="Status"
               value={job.status}
            />
         </Box>
      </Box>
   )
}

type DetailRowProps = {
   label: string
   value: React.ReactNode
}

const DetailRow = ({ label, value }: DetailRowProps) => {
   return (
      <Box className="flex items-center justify-between gap-4">
         <Typography className="text-xs!">{label}</Typography>

         <Typography
            className="text-xs! font-semibold!"
            color="textSecondary">
            {value}
         </Typography>
      </Box>
   )
}

export default JobInformation
