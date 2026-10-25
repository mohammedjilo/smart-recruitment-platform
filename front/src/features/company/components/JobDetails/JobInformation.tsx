import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined"
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import type { CompanyJob } from "@/types/company"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import {
   formatDate,
   formatSalary,
   getDaysRemaining,
   getStatusStyle
} from "@/utils/jobDetails.utils"
import { Box, Typography } from "@mui/material"
import { formatJobDeadline } from "@/utils/jobDeadline"

type InfoItemProps = {
   icon: React.ReactNode
   label: string
   children: React.ReactNode
}

const InfoItem = ({ icon, label, children }: InfoItemProps) => {
   return (
      <Box className="flex gap-3">
         <Box className="text-muted mt-0.5">{icon}</Box>

         <Box className="min-w-0">
            <Typography className="text-xs!">{label}</Typography>

            <Typography
               className="mt-1! text-sm! font-medium!"
               color="textSecondary">
               {children}
            </Typography>
         </Box>
      </Box>
   )
}

type JobInformationProps = {
   job: CompanyJob
}

const JobInformation = ({ job }: JobInformationProps) => {
   const deadlineInfo = getDaysRemaining(job.deadline)

   return (
      <section className="bg-surface rounded-xl border p-5">
         <Typography
            className="text-content! mb-6! text-base! font-semibold!"
            variant="h3">
            Job Information
         </Typography>

         <Box className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <InfoItem
               icon={<BusinessCenterOutlinedIcon className="text-lg!" />}
               label="Employment Type">
               <EmploymentTypeChip employmentType={job.employmentType} />
            </InfoItem>

            <InfoItem
               icon={<FingerprintOutlinedIcon className="text-lg!" />}
               label="Job ID">
               <Typography className="text-xs! break-all!">{job.id}</Typography>
            </InfoItem>

            <InfoItem
               icon={<WorkspacePremiumOutlinedIcon className="text-lg!" />}
               label="Experience Required">
               {job.experienceRequired} Years
            </InfoItem>

            <InfoItem
               icon={<LinkOutlinedIcon className="text-lg!" />}
               label="Slug">
               {job.slug}
            </InfoItem>

            <InfoItem
               icon={<AttachMoneyOutlinedIcon className="text-lg!" />}
               label="Salary">
               {formatSalary(job.salary)}
            </InfoItem>

            <InfoItem
               icon={<CalendarTodayOutlinedIcon className="text-lg!" />}
               label="Created At">
               {formatDate(job.createdAt, true)}
            </InfoItem>

            <InfoItem
               icon={<CalendarTodayOutlinedIcon className="text-lg!" />}
               label="Application Deadline">
               <Box>
                  <Typography>
                     {formatJobDeadline(job.deadline)}
                  </Typography>

                  <Typography
                     className={`mt-1! text-xs! font-medium! ${deadlineInfo.color} `}>
                     {deadlineInfo.text}
                  </Typography>
               </Box>
            </InfoItem>

            <InfoItem
               icon={<AccessTimeOutlinedIcon className="text-lg!" />}
               label="Last Updated">
               {formatDate(job.updatedAt, true)}
            </InfoItem>

            <InfoItem
               icon={<AccessTimeOutlinedIcon className="text-lg!" />}
               label="Job Status">
               <Typography
                  className={`rounded-md! px-2! py-1! text-xs! font-bold! ${getStatusStyle(job.status)} `}>
                  {job.status}
               </Typography>
            </InfoItem>
         </Box>
      </section>
   )
}

export default JobInformation
