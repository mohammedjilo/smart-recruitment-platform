import React from "react"

import {
   CalendarMonthOutlined,
   GroupsOutlined,
   PaidOutlined,
   WorkOutlineOutlined,
   EditOutlined,
   LightbulbOutlined
} from "@mui/icons-material"
import type { JobFormData } from "@/types/createJob.types"
import { Box, Button, Typography } from "@mui/material"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"

interface ReviewJobDetailsProps {
   form: JobFormData
   onEdit: () => void
}

const ReviewJobDetails: React.FC<ReviewJobDetailsProps> = ({ form, onEdit }) => {
   const formatStatus = (value: string) => {
      if (!value) return "-"

      return value.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
   }

   const formatExperience = (value: string) => {
      if (!value) return "-"

      return value.includes("Year") ? value : `${value} Years`
   }

   return (
      <section className="rounded-[9px] border border-border bg-surface">
         {/* Header */}
         <Box className="flex items-center justify-between border-b border-border px-5 py-4">
            <Typography className="text-sm! font-semibold! text-[#172033]">
               Review Job Details
            </Typography>

            <Button
               onClick={onEdit}
               className="text-primary! hover:bg-primary-tint! gap-1.5! rounded-md! bg-surface! px-3! py-1.5! text-[11px]! font-medium! outline! transition!">
               <EditOutlined sx={{ fontSize: 14 }} />
               Edit
            </Button>
         </Box>

         {/* Details */}
         <Box className="grid grid-cols-1 gap-x-8 px-5 py-2 md:grid-cols-2">
            {/* Job Title */}
            <ReviewItem
               icon={<GroupsOutlined sx={{ fontSize: 17 }} />}
               label="Job Title">
               <Typography
                  className="font-medium!"
                  color="textSecondary">
                  {form.title || "-"}
               </Typography>
            </ReviewItem>

            {/* Job Status */}
            <ReviewItem
               icon={<GroupsOutlined sx={{ fontSize: 17 }} />}
               label="Job Status">
               <Typography className="inline-flex! rounded-md! bg-green-50! px-2! py-0.5! text-[10px]! font-medium! text-green-600!">
                  {formatStatus(form.status)}
               </Typography>
            </ReviewItem>

            {/* Employment Type */}
            <ReviewItem
               icon={<WorkOutlineOutlined sx={{ fontSize: 17 }} />}
               label="Employment Type">
               <EmploymentTypeChip employmentType={form.employmentType} />
            </ReviewItem>

            {/* Deadline */}
            <ReviewItem
               icon={<CalendarMonthOutlined sx={{ fontSize: 17 }} />}
               label="Application Deadline">
               <Typography className="text-[11px]! font-medium text-red-600!">
                  {form.deadline || "-"}
               </Typography>
            </ReviewItem>

            {/* Experience */}
            <ReviewItem
               icon={<LightbulbOutlined sx={{ fontSize: 17 }} />}
               label="Experience Required">
               <Typography
                  className="text-[11px]! font-medium"
                  color="textSecondary">
                  {formatExperience(form.experience)}
               </Typography>
            </ReviewItem>

            {/* Skills */}
            <ReviewItem
               icon={<GroupsOutlined sx={{ fontSize: 17 }} />}
               label="Skills">
               {form.skills.length > 0 ? (
                  <Box className="flex flex-wrap gap-1.5">
                     {form.skills.map(skill => (
                        <Typography
                           key={skill}
                           className="rounded-md! border! border-border! bg-bg! px-2 py-0.5 text-[9px]! font-medium! text-muted">
                           {skill}
                        </Typography>
                     ))}
                  </Box>
               ) : (
                  <Typography className="text-[11px]! text-muted">
                     No skills added
                  </Typography>
               )}
            </ReviewItem>

            {/* Salary */}
            <ReviewItem
               icon={<PaidOutlined sx={{ fontSize: 17 }} />}
               label="Salary">
               <Typography
                  className="text-[11px]! font-medium"
                  color="textSecondary">
                  {form.salary || "-"}
               </Typography>
            </ReviewItem>
         </Box>
      </section>
   )
}

interface ReviewItemProps {
   icon: React.ReactNode
   label: string
   children: React.ReactNode
}

const ReviewItem: React.FC<ReviewItemProps> = ({ icon, label, children }) => {
   return (
      <Box className="flex min-h-15.5 items-start gap-3 border-b border-border py-3">
         <Box className="mt-0.5 flex w-5 shrink-0 justify-center text-muted">
            {icon}
         </Box>

         <Box className="min-w-0">
            <Typography className="text-[10px]!">{label}</Typography>

            <Box className="mt-1 text-[11px]">{children}</Box>
         </Box>
      </Box>
   )
}

export default ReviewJobDetails
