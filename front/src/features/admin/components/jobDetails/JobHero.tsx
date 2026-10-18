import { Avatar, Box, Typography } from "@mui/material"

import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined"
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"

import JobStatusChip from "@/components/common/JobStatusChip"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { AdminJobDetails } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"
import { formatJobDeadline } from "@/utils/jobDeadline"

type JobHeroProps = {
   job: AdminJobDetails
}

const formatSalary = (salary: number | null) => {
   if (salary === null) {
      return "Not specified"
   }

   return `$${salary.toLocaleString()}`
}

const JobHero = ({ job }: JobHeroProps) => {
   return (
      <Box className="bg-surface overflow-hidden rounded-xl border">
         <Box className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
            {/* Left Section */}

            <Box className="p-6">
               <Box className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <Avatar
                     src={job.company.logoUrl ?? undefined}
                     alt={job.company.companyName}
                     variant="rounded"
                     className="bg-primary/10 text-primary h-20 w-20 rounded-2xl text-3xl font-bold">
                     {job.company.companyName.charAt(0)}
                  </Avatar>

                  <Box>
                     <Typography className="text-content font-bold!">
                        {job.title}
                     </Typography>

                     <Typography className="mt-1! text-sm! font-semibold!">
                        {job.company.companyName}
                     </Typography>

                     <Box className="mt-3 flex items-center gap-2">
                        <JobStatusChip status={job.status} />

                        <EmploymentTypeChip employmentType={job.employmentType} />
                     </Box>
                  </Box>
               </Box>

               <Box className="border-border mt-6 grid grid-cols-2 gap-5 border-t pt-5 lg:grid-cols-4">
                  <MetaItem
                     icon={<CalendarMonthOutlinedIcon />}
                     label="Posted On"
                     value={formatDate(job.createdAt)}
                  />

                  <MetaItem
                     icon={<CalendarMonthOutlinedIcon />}
                     label="Deadline"
                     value={formatJobDeadline(job.deadline)}
                  />

                  <MetaItem
                     icon={<BusinessCenterOutlinedIcon />}
                     label="Applications"
                     value={String(job._count.applications)}
                  />

                  <MetaItem
                     icon={<AccountTreeOutlinedIcon />}
                     label="Job ID"
                     value={job.id.slice(0, 12)}
                  />
               </Box>
            </Box>

            {/* Right Section */}

            <Box className="border-t p-6 xl:border-t-0 xl:border-l">
               <Box className="space-y-5">
                  <SideInfo
                     icon={<WorkOutlineOutlinedIcon />}
                     label="Employment Type"
                     value={<EmploymentTypeChip employmentType={job.employmentType} />}
                  />

                  <SideInfo
                     icon={<PersonOutlineRoundedIcon />}
                     label="Experience Required"
                     value={`${job.experienceRequired} years`}
                  />

                  <SideInfo
                     icon={<AttachMoneyOutlinedIcon />}
                     label="Salary"
                     value={formatSalary(job.salary)}
                  />

                  <SideInfo
                     icon={<BusinessCenterOutlinedIcon />}
                     label="Status"
                     value={job.status}
                  />

                  <SideInfo
                     icon={<BusinessCenterOutlinedIcon />}
                     label="Posted By"
                     value={job.company.companyName}
                  />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

type MetaItemProps = {
   icon: React.ReactNode
   label: string
   value: React.ReactNode
}

const MetaItem = ({ icon, label, value }: MetaItemProps) => {
   return (
      <Box className="flex items-start gap-2">
         <Box className="text-primary">{icon}</Box>

         <Box>
            <Typography className="text-[10px]!">{label}</Typography>

            <Typography
               className="mt-1! text-xs! font-semibold! break-all!"
               color="textSecondary">
               {value}
            </Typography>
         </Box>
      </Box>
   )
}

type SideInfoProps = {
   icon: React.ReactNode
   label: string
   value: React.ReactNode
}

const SideInfo = ({ icon, label, value }: SideInfoProps) => {
   return (
      <Box className="flex items-start gap-3">
         <Box className="bg-primary/5 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            {icon}
         </Box>

         <Box>
            <Typography className="text-[10px]!">{label}</Typography>

            <Typography
               className="mt-1! text-xs! font-semibold!"
               color="textSecondary">
               {value}
            </Typography>
         </Box>
      </Box>
   )
}

export default JobHero
