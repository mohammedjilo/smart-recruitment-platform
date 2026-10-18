import type { EmploymentType } from "@/types/job"
import {
   Bookmark,
   CalendarMonth,
   CheckCircleOutlined,
   LocationOn,
   WorkOutlined
} from "@mui/icons-material"
import { Box, IconButton, Tooltip, Typography } from "@mui/material"
import { useToggleSaveJobsMutation } from "@/services/shared/jobApiCalls"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import { useNavigate } from "react-router-dom"
import { formatJobDeadline } from "@/utils/jobDeadline"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"
interface job {
   id: string
   title: string
   employmentType: EmploymentType
   salary: number | null
   deadline: Date
   experienceRequired: number
   slug: string
   isApplied?: boolean
   isSaved?: boolean
   company: {
      id: string
      companyName: string
      logoUrl: string | null
   }
}

const SavedJobItem = ({ job }: { job: job }) => {
   const [toggleSaveJobs, mutationResult] = useToggleSaveJobsMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "action",
      importance: "routine"
   })
   const isSaving = mutationPresentation.category === "loading"
   const navigate = useNavigate()
   const handleToggleSave = async () => {
      try {
         await toggleSaveJobs({ jobId: job.id }).unwrap()
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "routine" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Could not update saved jobs",
            text: errorPresentation.message
         })
      }
   }
   return (
      <Box className="group grid min-h-26 grid-cols-1 items-center gap-5 border-b border-[#edf0f5] px-5 py-4 transition last:border-b-0 hover:bg-[#fcfcff] md:grid-cols-[minmax(280px,1.6fr)_150px_135px_145px_90px]">
         {/* --------------------------------- */}
         {/* Job */}
         {/* --------------------------------- */}

         <Box className="flex min-w-0 items-center gap-4">
            {/* Logo */}
            <Box className="bg-surface flex h-13.5 w-13.5 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e7e9ef]">
               {job.company.logoUrl ? (
                  <img
                     src={job.company.logoUrl}
                     alt={job.company.companyName}
                     className="h-full w-full object-contain p-1.5"
                  />
               ) : (
                  <span className="text-lg font-bold text-[#5521ed]">
                     {job.company.companyName.charAt(0).toUpperCase()}
                  </span>
               )}
            </Box>

            <Box className="min-w-0">
               <Typography
                  className="w-max cursor-pointer truncate text-[15px] font-bold hover:underline"
                  onClick={() => navigate(`/jobs/${job.id}/${job.slug}`)}>
                  {job.title}
               </Typography>

               <Typography className="mt-1! flex items-center gap-1 text-[13px]! font-medium! text-[#4e5670]!">
                  {job.company.companyName}

                  {/* Verified */}
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2479e8] text-[9px] font-bold text-white">
                     ✓
                  </span>
               </Typography>

               <Box className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#717a91]">
                  <span className="flex items-center gap-1">
                     <LocationOn
                        sx={{
                           fontSize: 13
                        }}
                     />
                     Location not specified
                  </span>

                  <span className="text-[#c7cad3]">•</span>

                  <span className="flex items-center gap-1">
                     <WorkOutlined
                        sx={{
                           fontSize: 12
                        }}
                     />

                     <EmploymentTypeChip employmentType={job.employmentType} />
                  </span>
               </Box>
            </Box>
         </Box>

         {/* --------------------------------- */}
         {/* Salary */}
         {/* --------------------------------- */}

         <Box className="border-l border-[#edf0f5] pl-5">
            <Typography className="text-[13px]! font-semibold! text-[#1b223a]!">
               {job.salary}
            </Typography>

            <Typography className="mt-1! text-[11px]! text-[#7c8498]!">Salary</Typography>
         </Box>

         {/* --------------------------------- */}
         {/* Experience */}
         {/* --------------------------------- */}

         <Box className="border-l border-[#edf0f5] pl-5">
            <Typography className="text-[13px]! font-semibold! text-[#1b223a]!">
               {job.experienceRequired}+ {job.experienceRequired === 1 ? "year" : "years"}
            </Typography>

            <Typography className="mt-1! text-[11px]! text-[#7c8498]!">
               Experience
            </Typography>
         </Box>

         {/* --------------------------------- */}
         {/* Deadline */}
         {/* --------------------------------- */}

         <Box className="border-l border-[#edf0f5] pl-5">
            <Typography className="text-[13px]! font-semibold! text-[#1b223a]!">
               {formatJobDeadline(job.deadline)}
            </Typography>

            <Typography className="mt-1! flex items-center gap-1 text-[11px]! text-[#7c8498]!">
               <CalendarMonth
                  sx={{
                     fontSize: 12
                  }}
               />
               Deadline
            </Typography>
         </Box>

         {/* --------------------------------- */}
         {/* Actions */}
         {/* --------------------------------- */}

         <Box className="flex items-center justify-end gap-1">
            {job.isApplied && (
               <Tooltip title="This job has already been applied to.">
                  <Box className="flex items-center justify-center">
                     <CheckCircleOutlined
                        sx={{
                           fontSize: 18,
                           color: "#16a34a"
                        }}
                        aria-label="Applied"
                     />
                  </Box>
               </Tooltip>
            )}

            <IconButton
               size="small"
               color="primary"
               disabled={isSaving}
               onClick={() => void handleToggleSave()}>
               <Bookmark
                  sx={{
                     fontSize: 22
                  }}
               />
            </IconButton>
         </Box>
      </Box>
   )
}

export default SavedJobItem
