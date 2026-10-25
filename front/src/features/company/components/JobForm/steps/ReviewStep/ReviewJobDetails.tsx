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
      <section className="border-border bg-surface rounded-[9px] border">
         {/* Header */}
         <Box className="border-border flex items-center justify-between border-b px-5 py-4">
            <Typography className="text-sm! font-semibold! text-[#172033]">
               Review Job Details
            </Typography>

            <Button
               className="text-primary! hover:bg-primary-tint! bg-surface! gap-1.5! rounded-md! px-3! py-1.5! text-[11px]! font-medium! outline! transition!"
               type="button"
               onClick={onEdit}>
               <EditOutlined className="text-sm!" />
               Edit
            </Button>
         </Box>

         {/* Details */}
         <Box className="grid grid-cols-1 gap-x-8 px-5 py-2 md:grid-cols-2">
            {/* Job Title */}
            <ReviewItem
               icon={<GroupsOutlined className="text-[17px]!" />}
               label="Job Title">
               <Typography
                  className="font-medium!"
                  color="textSecondary">
                  {form.title || "-"}
               </Typography>
            </ReviewItem>

            {/* Job Status */}
            <ReviewItem
               icon={<GroupsOutlined className="text-[17px]!" />}
               label="Job Status">
               <Typography className="inline-flex! rounded-md! bg-green-50! px-2! py-0.5! text-[10px]! font-medium! text-green-600!">
                  {formatStatus(form.status)}
               </Typography>
            </ReviewItem>

            {/* Employment Type */}
            <ReviewItem
               icon={<WorkOutlineOutlined className="text-[17px]!" />}
               label="Employment Type">
               <EmploymentTypeChip employmentType={form.employmentType} />
            </ReviewItem>

            {/* Deadline */}
            <ReviewItem
               icon={<CalendarMonthOutlined className="text-[17px]!" />}
               label="Application Deadline">
               <Typography className="text-[11px]! font-medium text-red-600!">
                  {form.deadline || "-"}
               </Typography>
            </ReviewItem>

            {/* Experience */}
            <ReviewItem
               icon={<LightbulbOutlined className="text-[17px]!" />}
               label="Experience Required">
               <Typography
                  className="text-[11px]! font-medium"
                  color="textSecondary">
                  {formatExperience(form.experience)}
               </Typography>
            </ReviewItem>

            {/* Skills */}
            <ReviewItem
               icon={<GroupsOutlined className="text-[17px]!" />}
               label="Skills">
               {form.skills.length > 0 ? (
                  <Box className="flex flex-wrap gap-1.5">
                     {form.skills.map(skill => (
                        <Typography
                           className="border-border! bg-bg! text-muted rounded-md! border! px-2 py-0.5 text-[9px]! font-medium!"
                           key={skill}>
                           {skill}
                        </Typography>
                     ))}
                  </Box>
               ) : (
                  <Typography className="text-muted text-[11px]!">
                     No skills added
                  </Typography>
               )}
            </ReviewItem>

            {/* Salary */}
            <ReviewItem
               icon={<PaidOutlined className="text-[17px]!" />}
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
      <Box className="border-border flex min-h-15.5 items-start gap-3 border-b py-3">
         <Box className="text-muted mt-0.5 flex w-5 shrink-0 justify-center">{icon}</Box>

         <Box className="min-w-0">
            <Typography className="text-[10px]!">{label}</Typography>

            <Box className="mt-1 text-[11px]">{children}</Box>
         </Box>
      </Box>
   )
}

export default ReviewJobDetails
