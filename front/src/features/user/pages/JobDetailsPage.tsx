import React, { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowBack } from "@mui/icons-material"

import {
   useGetJobByIdQuery,
   useToggleSaveJobsMutation
} from "@/services/shared/jobApiCalls"
import { getUserCompanyDetailsPath } from "@/utils/companyRoutes"
import { Box, Button } from "@mui/material"
import ApplyModal from "@/features/user/components/JobDetails/application/ApplyModal"
import JobIntroduction from "@/features/user/components/JobDetails/JobIntroduction"
import CompanyCard from "@/features/user/components/JobDetails/CompanyCard"
import JobDescription from "@/features/user/components/JobDetails/JobDescription"
import JobApplicationPanel from "@/features/user/components/JobDetails/JobApplicationPanel"
import type { RootState } from "@/redux/store"
import { UserJobDetailsSkeleton } from "@/features/user/components/UserSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"

// =====================================================
// Job Details
// =====================================================

const JobDetailsPage: React.FC = () => {
   const navigate = useNavigate()
   const userId = useSelector((state: RootState) => state.auth.user?.id)

   const { id, slug } = useParams()
   const [openApplyModal, setOpenApplyModal] = useState(false)

   const query = useGetJobByIdQuery(
      { id: id ?? "", slug: slug ?? "" },
      { skip: !id || !slug }
   )
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"
   const [toggleSaveJobs, saveResult] = useToggleSaveJobsMutation()
   const saveState = getMutationState(saveResult)
   const savePresentation = getMutationPresentation(saveState, {
      surface: "action",
      importance: "routine"
   })
   const isSavingJob = savePresentation.category === "loading"

   // ==================================================
   // Loading
   // ==================================================

   if (isLoading) {
      return <UserJobDetailsSkeleton />
   }

   // ==================================================
   // Error
   // ==================================================

   if (!id || !slug) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
            <Box className="bg-surface rounded-xl border border-[#e9ebf1] px-10 py-12 text-center">
               <h2 className="text-xl font-bold text-[#10142c]">Job not found</h2>

               <p className="mt-2 text-sm text-[#69718a]">We couldn't find this job.</p>
               <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/jobs")}
                  className="mt-6 rounded-lg px-6 py-3 text-sm font-semibold">
                  Back to Jobs
               </Button>
            </Box>
         </main>
      )
   }
   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
            <Box className="bg-surface rounded-xl border border-[#e9ebf1] px-10 py-12 text-center">
               <h2 className="text-xl font-bold text-[#10142c]">
                  {queryPresentation.message}
               </h2>
               <Button
                  onClick={query.refetch}
                  className="mt-4 mr-2 rounded-lg px-6 py-3 text-sm font-semibold">
                  Retry
               </Button>
               <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/jobs")}
                  className="mt-6 rounded-lg px-6 py-3 text-sm font-semibold">
                  Back to Jobs
               </Button>
            </Box>
         </main>
      )
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!response?.data) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
            <Box className="bg-surface rounded-xl border border-[#e9ebf1] px-10 py-12 text-center">
               <h2 className="text-xl font-bold text-[#10142c]">
                  Job details could not be determined.
               </h2>
               <Button
                  onClick={() => navigate("/jobs")}
                  className="mt-6 rounded-lg px-6 py-3 text-sm font-semibold">
                  Back to Jobs
               </Button>
            </Box>
         </main>
      )
   }

   // ==================================================
   // Data
   // ==================================================

   const job = response.data
   const handleToggleSave = async () => {
      try {
         await toggleSaveJobs({ jobId: job.id }).unwrap()
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Could not update saved jobs",
            text: errorPresentation.message
         })
      }
   }

   return (
      <main className="min-h-screen">
         <Box className="mx-auto max-w-360">
            {queryPresentation.category === "stale_error" && (
               <Box className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <span>{queryPresentation.message}</span>
                  <Button
                     onClick={query.refetch}
                     className="normal-case!">
                     Retry
                  </Button>
               </Box>
            )}
            {/* =================================================
                Back To Jobs
            ================================================= */}

            <Button
               onClick={() => navigate("/jobs")}
               className="app-button-secondary mb-5! flex! items-center! gap-2! text-sm! font-medium! capitalize! transition!">
               <ArrowBack
                  sx={{
                     fontSize: 18
                  }}
               />
               Back to Jobs
            </Button>

            {/* =================================================
                TOP AREA
            ================================================= */}

            <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_365px]">
               <JobIntroduction job={job} />
               <CompanyCard
                  company={job.company}
                  onViewCompany={() =>
                     navigate(getUserCompanyDetailsPath(job.company.id, job.company.slug))
                  }
               />
               <JobDescription job={job} />
               <JobApplicationPanel
                  job={job}
                  isSaving={isSavingJob}
                  onApply={() => setOpenApplyModal(true)}
                  onToggleSave={() => void handleToggleSave()}
               />
            </Box>
         </Box>
         <ApplyModal
            open={openApplyModal}
            handleClose={() => setOpenApplyModal(false)}
            userId={userId ?? ""}
            companyId={job.company.id}
            jobSummaryData={{
               companyName: job.company.companyName,
               title: job.title,
               salary: job.salary,
               logoUrl: job.company.logoUrl,
               createdAt: job.createdAt,
               location: job.company.location,
               employmentType: job.employmentType,
               deadline: job.deadline,
               skills: job.skills
            }}
         />
      </main>
   )
}

export default JobDetailsPage
