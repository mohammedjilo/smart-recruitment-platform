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
         <h3 className="text-content mb-6 text-base font-semibold">Job Information</h3>

         <Box className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <InfoItem
               icon={<BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Employment Type">
               <EmploymentTypeChip employmentType={job.employmentType} />
            </InfoItem>

            <InfoItem
               icon={<FingerprintOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Job ID">
               <Typography className="text-xs! break-all!">{job.id}</Typography>
            </InfoItem>

            <InfoItem
               icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Experience Required">
               {job.experienceRequired} Years
            </InfoItem>

            <InfoItem
               icon={<LinkOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Slug">
               {job.slug}
            </InfoItem>

            <InfoItem
               icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Salary">
               {formatSalary(job.salary)}
            </InfoItem>

            <InfoItem
               icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Created At">
               {formatDate(job.createdAt, true)}
            </InfoItem>

            <InfoItem
               icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Application Deadline">
               <Box>
                  <p>{formatJobDeadline(job.deadline)}</p>

                  <Typography
                     className={`mt-1! text-xs! font-medium! ${deadlineInfo.color} `}>
                     {deadlineInfo.text}
                  </Typography>
               </Box>
            </InfoItem>

            <InfoItem
               icon={<AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />}
               label="Last Updated">
               {formatDate(job.updatedAt, true)}
            </InfoItem>

            <InfoItem
               icon={<AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />}
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
