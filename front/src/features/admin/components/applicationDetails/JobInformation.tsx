import { Avatar, Box, Typography } from "@mui/material"

import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { AdminApplicationDetails } from "@/types/admin"

type JobInformationProps = {
   job: AdminApplicationDetails["job"]
}

const formatSalary = (salary: number | null) => {
   if (salary === null) {
      return "Not specified"
   }

   return `$${salary}`
}

const JobInformation = ({ job }: JobInformationProps) => {
   return (
      <Box className="p-6">
         <Box className="flex items-start gap-4">
            <Avatar
               src={job.company.logoUrl ?? undefined}
               variant="rounded"
               className="bg-primary/10 text-primary h-12 w-12 rounded-xl">
               <BusinessCenterOutlinedIcon />
            </Avatar>

            <Box>
               <Typography className="text-muted text-sm! font-medium!">
                  Job Information
               </Typography>

               <Typography className="mt-2! text-base! font-bold!">
                  {job.title}
               </Typography>

               <Typography className="mt-1! text-xs! font-semibold!">
                  {job.company.companyName}
               </Typography>
            </Box>
         </Box>

         <Box className="mt-7 space-y-4">
            <InfoRow
               label="Job ID"
               value={job.id.slice(0, 12)}
            />

            <InfoRow
               label="Employment Type"
               value={<EmploymentTypeChip employmentType={job.employmentType} />}
            />

            <InfoRow
               label="Salary"
               value={formatSalary(job.salary)}
            />
         </Box>
      </Box>
   )
}

type InfoRowProps = {
   label: string
   value: React.ReactNode
}

const InfoRow = ({ label, value }: InfoRowProps) => {
   return (
      <Box className="grid grid-cols-[120px_1fr] gap-4">
         <Typography className="text-xs!">{label}</Typography>

         <Typography
            className="text-xs! font-semibold! break-all!"
            color="textSecondary">
            {value}
         </Typography>
      </Box>
   )
}

export default JobInformation
