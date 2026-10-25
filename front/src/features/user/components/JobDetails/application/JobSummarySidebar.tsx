import React from "react"
import {
   LocationOnOutlined,
   CalendarTodayOutlined,
   AttachMoneyOutlined
} from "@mui/icons-material"
import { Avatar, Box, Typography } from "@mui/material"

import type { EmploymentType } from "@/types/job"
import formatCreatedAt from "@/utils/formatDate"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import { formatJobDeadline } from "@/utils/jobDeadline"

interface SummaryItemProps {
   icon: React.ReactNode
   title: string
   value: React.ReactNode
   danger?: boolean
}
interface JobSummarySidebarProps {
   data: {
      companyName: string
      logoUrl: string | null
      location: string | null
      salary: number | null
      title: string
      employmentType: EmploymentType
      createdAt: Date
      deadline: string | Date
      skills: { skill: { skillName: string } }[]
   }
}
function SummaryItem({ icon, title, value, danger }: SummaryItemProps) {
   return (
      <Box className="mb-5 flex gap-3">
         <Box className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            {icon}
         </Box>
         <Box>
            <Typography className="text-xs!">{title}</Typography>
            <Typography
               className={`text-sm! font-semibold! ${danger ? "text-red-500!" : ""}`}
               color="textSecondary">
               {value}
            </Typography>
         </Box>
      </Box>
   )
}
const JobSummarySidebar: React.FC<JobSummarySidebarProps> = ({ data }) => {
   return (
      <Box className="p-5">
         <Typography className="mb-6! text-sm! font-semibold!">Job Summary</Typography>

         <Box className="mb-6 flex items-center gap-3">
            <Avatar src={`${data.logoUrl}`} />
            <Box>
               <Typography className="text-sm! font-semibold">{data.title}</Typography>
               <Typography
                  className="text-xs!"
                  color="textSecondary">
                  {data.companyName}
               </Typography>
            </Box>
         </Box>

         <SummaryItem
            value={data.location || "none"}
            icon={<LocationOnOutlined />}
            title="Location"
         />
         <SummaryItem
            value={<EmploymentTypeChip employmentType={data.employmentType} />}
            icon={<CalendarTodayOutlined />}
            title="Employment Type"
         />
         <SummaryItem
            value={data.salary?.toString() || "0"}
            icon={<AttachMoneyOutlined />}
            title="Salary"
         />
         <SummaryItem
            value={formatCreatedAt(data.createdAt)}
            icon={<CalendarTodayOutlined />}
            title="Posted On"
         />
         <SummaryItem
            value={formatJobDeadline(data.deadline)}
            danger
            icon={<CalendarTodayOutlined />}
            title="Deadline"
         />

         <Box className="mt-6 border-t pt-5">
            <Typography className="mb-3! text-sm! font-semibold!">Skills</Typography>
            <Box className="flex flex-wrap gap-2">
               {data.skills.map((skill, id) => (
                  <Typography
                     className="rounded-md! bg-gray-100! px-3! py-1! text-xs!"
                     key={id}>
                     {skill.skill.skillName}
                  </Typography>
               ))}
            </Box>
         </Box>

         <Box className="mt-8 rounded-lg bg-purple-50 p-4 text-xs text-purple-700">
            Have questions about this role?
            <br />
            <Typography className="text-xs! font-semibold!">
               Contact the hiring team
            </Typography>
         </Box>
      </Box>
   )
}

export default JobSummarySidebar
