import {
   BookmarkBorderOutlined,
   CalendarTodayOutlined,
   CheckCircleOutlined,
   LocationOnOutlined,
   Verified
} from "@mui/icons-material"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { JobSummary } from "@/types/job"
import formatCreatedAt from "@/utils/formatDate"

type JobListItemProps = {
   job: JobSummary
   isLast: boolean
   isSaving: boolean
   onToggleSave: (jobId: string) => void
}

export default function JobListItem({
   job,
   isLast,
   isSaving,
   onToggleSave
}: JobListItemProps) {
   return (
      <article
         className={`group relative flex min-h-32.25 items-center px-7 py-5 transition-colors duration-200 hover:bg-[#fcfcff] ${
            !isLast ? "border-b border-[#edf0f3]" : ""
         }`}>
         <Box className="flex min-w-0 flex-1 items-center">
            <Avatar
               className="h-24! w-24!"
               src={job.company.logoUrl ?? undefined}
               variant="rounded"
            />

            <Box className="ml-7 min-w-0">
               <Typography
                  className="truncate! text-[16px]! leading-5! font-bold! hover:underline"
                  component={Link}
                  to={`/jobs/${job.id}/${job.slug}`}>
                  {job.title}
               </Typography>

               <Box className="mt-1.25 flex items-center gap-1">
                  <Typography className="text-[13px]! font-medium! text-[#647089]">
                     {job.company.companyName}
                  </Typography>
                  <Verified className="text-sm! text-[#6741e8]!" />
               </Box>

               <Box className="mt-1.5 flex flex-wrap items-center gap-2 text-xs! text-[#727d94]">
                  <Typography className="flex items-center gap-1 text-xs!">
                     <LocationOnOutlined className="text-sm!" />
                     {job.company.location}
                  </Typography>
               </Box>

               <Box className="mt-2 flex flex-wrap gap-1.75">
                  {job.skills.map(skill => (
                     <Typography
                        className="rounded-md! bg-[#f5f6f9]! px-2.5! text-[11px]! font-medium! text-[#778197]"
                        key={skill.skill.skillName}>
                        {skill.skill.skillName}
                     </Typography>
                  ))}
               </Box>
            </Box>
         </Box>

         <Box className="ml-5 flex w-67.5 shrink-0 flex-col items-end">
            <EmploymentTypeChip employmentType={job.employmentType} />
            <Typography className="mt-2.5! text-[13px]! font-medium! text-[#667188]!">
               {job.salary != null ? `${job.salary} SAR` : "—"}
            </Typography>
            <Box className="mt-2 flex items-center gap-2 text-xs! text-[#707b92]">
               <CalendarTodayOutlined className="text-[15px]!" />
               <Typography className="text-xs!">
                  {formatCreatedAt(job.createdAt)}
               </Typography>
            </Box>
         </Box>

         <Box className="ml-8 flex shrink-0 flex-col items-center gap-1">
            {job.isApplied && (
               <Tooltip title="This job has already been applied to.">
                  <Box className="flex items-center justify-center">
                     <CheckCircleOutlined
                        className="text-lg! text-green-600!"
                        aria-label="Applied"
                     />
                  </Box>
               </Tooltip>
            )}
            <IconButton
               className="flex h-12! w-12! items-center! justify-center! transition!"
               aria-label={`Save ${job.title}`}
               disabled={isSaving}
               color="primary"
               onClick={() => onToggleSave(job.id)}>
               {job.isSaved ? (
                  <BookmarkIcon className="text-[26px]!" />
               ) : (
                  <BookmarkBorderOutlined className="text-[26px]!" />
               )}
            </IconButton>
         </Box>
      </article>
   )
}
