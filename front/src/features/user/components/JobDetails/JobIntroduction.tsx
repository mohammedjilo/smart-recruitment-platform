import {
   AccessTimeOutlined,
   CalendarTodayOutlined,
   LocationOnOutlined,
   Verified,
   WorkOutlined
} from "@mui/icons-material"
import { Avatar, Box, Typography } from "@mui/material"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { JobDetails } from "@/types/api/jobs"
import { formatDate } from "@/utils/formatDate"
import { formatJobDeadline } from "@/utils/jobDeadline"

type JobIntroductionProps = {
   job: JobDetails
}

const formatSalary = (salary: number) =>
   new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
   }).format(salary)

const JobIntroduction = ({ job }: JobIntroductionProps) => {
   const skills = job.skills?.map(item => item.skill?.skillName) ?? []
   const salary = job.salary ? formatSalary(job.salary) : null
   const postedDate = formatDate(job.createdAt)
   const deadline = formatJobDeadline(job.deadline)

   return (
      <section className="bg-surface rounded-xl border border-[#e8eaf0] px-6 py-6 shadow-[0_2px_8px_rgba(20,30,60,0.035)] lg:px-7">
         <Box className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <Box className="bg-surface flex h-27 w-27 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#edf0f4] shadow-[0_2px_7px_rgba(20,30,60,0.04)]">
               {job.company.logoUrl ? (
                  <Avatar
                     className="h-full! w-full! object-contain"
                     alt={job.company.companyName}
                     src={job.company.logoUrl}
                     variant="rounded"
                  />
               ) : (
                  <span className="text-4xl font-bold text-[#4f20e8]">
                     {job.company.companyName?.charAt(0)?.toUpperCase()}
                  </span>
               )}
            </Box>

            <Box className="min-w-0 flex-1">
               <Box className="mb-3">
                  <EmploymentTypeChip employmentType={job.employmentType} />
               </Box>

               <Typography
                  className="text-[26px]! leading-[1.2]! font-bold! tracking-[-0.02em]!"
                  component="h1">
                  {job.title}
               </Typography>

               <Box className="mt-2 flex items-center gap-1.5">
                  <span className="text-[17px] font-medium text-[#11162f]">
                     {job.company.companyName}
                  </span>
                  <Verified className="text-lg! text-[#1477e8]!" />
               </Box>

               <Box className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#424b67]">
                  <Box className="flex items-center gap-2">
                     <LocationOnOutlined className="text-[19px]! text-[#111936]!" />
                     <span>{job.company.location}</span>
                  </Box>
                  <Box className="flex items-center gap-2">
                     <WorkOutlined className="text-[19px]! text-[#111936]!" />
                     <span>{job.employmentType}</span>
                  </Box>
               </Box>

               {skills.length > 0 && (
                  <Box className="mt-5 flex flex-wrap gap-2">
                     {skills.map(skill => (
                        <span
                           className="rounded-md bg-[#f3f4f8] px-3 py-1.5 text-[13px] font-medium text-[#222a43]"
                           key={skill}>
                           {skill}
                        </span>
                     ))}
                  </Box>
               )}
            </Box>

            <Box className="flex shrink-0 flex-col items-start lg:items-end">
               <Box className="text-[18px] font-bold text-[#4b20e5] lg:text-[19px]">
                  {salary}
               </Box>
               <Box className="mt-1 text-[14px] text-[#424b67]">per year</Box>
               <Box className="mt-7 flex items-center gap-2 text-[14px] text-[#424b67]">
                  <CalendarTodayOutlined className="text-lg!" />
                  <span>Posted on {postedDate}</span>
               </Box>
               <Box className="mt-5 flex items-center gap-2 text-[14px] text-[#424b67]">
                  <AccessTimeOutlined className="text-[19px]!" />
                  <span>Deadline</span>
                  <span className="font-medium text-red-500">{deadline}</span>
               </Box>
            </Box>
         </Box>
      </section>
   )
}

export default JobIntroduction
