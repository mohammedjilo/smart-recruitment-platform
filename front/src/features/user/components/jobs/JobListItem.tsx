import {
   BookmarkBorderOutlined,
   CalendarTodayOutlined,
   CheckCircleOutlined,
   LocationOnOutlined,
   Verified
} from "@mui/icons-material"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import { Avatar, Box, IconButton, Typography } from "@mui/material"
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
         className={`group relative flex min-h-[129px] items-center px-7 py-5 transition-colors duration-200 hover:bg-[#fcfcff] ${
            !isLast ? "border-b border-[#edf0f3]" : ""
         }`}>
         <Box className="flex min-w-0 flex-1 items-center">
            <Avatar
               className="h-24! w-24!"
               variant="rounded"
               src={job.company.logoUrl ?? undefined}
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
                  <Verified sx={{ fontSize: 14, color: "#6741e8" }} />
               </Box>

               <Box className="mt-1.5 flex flex-wrap items-center gap-2 text-xs! text-[#727d94]">
                  <Typography className="flex items-center gap-1 text-xs!">
                     <LocationOnOutlined sx={{ fontSize: 14 }} />
                     {job.company.location}
                  </Typography>
               </Box>

               <Box className="mt-2 flex flex-wrap gap-1.75">
                  {job.skills.map(skill => (
                     <Typography
                        key={skill.skill.skillName}
                        className="rounded-md! bg-[#f5f6f9]! px-2.5! text-[11px]! font-medium! text-[#778197]">
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
               <CalendarTodayOutlined sx={{ fontSize: 15 }} />
               <Typography className="text-xs!">
                  {formatCreatedAt(job.createdAt)}
               </Typography>
            </Box>
         </Box>

         <Box className="ml-8 flex shrink-0 flex-col items-center gap-1">
            {job.isApplied && (
               <CheckCircleOutlined
                  className="text-green-600!"
                  sx={{ fontSize: 18 }}
                  aria-label="Applied"
               />
            )}
            <IconButton
               color="primary"
               className="flex h-12! w-12! items-center! justify-center! transition!"
               disabled={isSaving}
               onClick={() => onToggleSave(job.id)}
               aria-label={`Save ${job.title}`}>
               {job.isSaved ? (
                  <BookmarkIcon sx={{ fontSize: 26 }} />
               ) : (
                  <BookmarkBorderOutlined sx={{ fontSize: 26 }} />
               )}
            </IconButton>
         </Box>
      </article>
   )
}
