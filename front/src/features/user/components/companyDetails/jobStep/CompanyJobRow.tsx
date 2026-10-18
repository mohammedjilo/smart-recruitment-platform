import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material"
import { JOB_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"
import BookmarkBorderOutlined from "@mui/icons-material/BookmarkBorderOutlined"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined"
import EmploymentTypeChip from "@/components/common/EmploymentTypeChip"
import type { CompanyJob, JobStatus } from "@/types/user"
import { useToggleSaveJobsMutation } from "@/services/shared/jobApiCalls"
import { formatDate } from "@/utils/formatDate"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"

type Props = {
   job: CompanyJob
   isLast: boolean
}

const CompanyJobRow = ({ job, isLast }: Props) => {
   const navigate = useNavigate()
   const [isSaved, setIsSaved] = useState(job.isSaved)
   const [toggleSaveJobs, mutationResult] = useToggleSaveJobsMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "action",
      importance: "routine"
   })
   const isSaving = mutationPresentation.category === "loading"

   useEffect(() => {
      setIsSaved(job.isSaved)
   }, [job.isSaved])

   const formatSalary = (salary: number | null) => {
      if (salary === null) {
         return "—"
      }

      return new Intl.NumberFormat("en-US", {
         style: "currency",
         currency: "USD",
         maximumFractionDigits: 0
      }).format(salary)
   }

   const getStatusClass = (status: JobStatus) => {
      return getStatusClassName(status, JOB_STATUS_TONE_MAP)
   }

   const handleViewDetails = () => {
      navigate(`/jobs/${job.id}/${job.slug}`)
   }

   const handleToggleSave = async () => {
      try {
         await toggleSaveJobs({ jobId: job.id }).unwrap()
         setIsSaved(previous => !previous)
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
      <Box
         className={`grid grid-cols-1 gap-5 px-6 py-5 transition-colors hover:bg-bg/70 xl:grid-cols-[minmax(260px,2.2fr)_minmax(110px,0.8fr)_minmax(120px,0.9fr)_minmax(100px,0.7fr)_minmax(120px,0.9fr)_auto] xl:items-center ${
            !isLast ? "border-b border-border" : ""
         } `}>
         {/* Job Title and Experience */}
         <Box className="min-w-0">
            <Typography className="text-sm! font-bold! text-violet-700">
               {job.title}
            </Typography>

            <Typography className="mt-2! text-xs!" color="textSecondary">
               Experience: {job.experienceRequired}{" "}
               {job.experienceRequired === 1 ? "year" : "years"}
            </Typography>
         </Box>

         {/* Employment Type */}
         <Box>
            <EmploymentTypeChip employmentType={job.employmentType} />
         </Box>

         {/* Salary */}
         <Box>
            <Typography className="text-sm!" color="textSecondary">
               {formatSalary(job.salary)}
            </Typography>
         </Box>

         {/* Status */}
         <Box>
            <Box
               className={`inline-flex rounded px-2.5 py-1 text-[10px] font-bold ${getStatusClass(job.status)} `}>
               {job.status}
            </Box>
         </Box>

         {/* Created At */}
         <Box>
            <Typography className="text-sm!" color="textSecondary">
               {formatDate(job.createdAt)}
            </Typography>
         </Box>

         {/* Action */}
         <Box className="flex items-center gap-2 xl:justify-self-end">
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

            <Button
               onClick={handleViewDetails}
               variant="outlined"
               color="primary"
               className="min-w-29.5! rounded-lg! px-5! py-2! text-xs! font-semibold! normal-case! transition-colors!">
               View Details
            </Button>

            <IconButton
               color="primary"
               onClick={handleToggleSave}
               disabled={isSaving}
               aria-label={
                  isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`
               }
               className="hover:bg-primary-tint!">
               {isSaved ? (
                  <BookmarkIcon
                     sx={{
                        fontSize: 28
                     }}
                  />
               ) : (
                  <BookmarkBorderOutlined
                     sx={{
                        fontSize: 28
                     }}
                  />
               )}
            </IconButton>
         </Box>
      </Box>
   )
}

export default CompanyJobRow
