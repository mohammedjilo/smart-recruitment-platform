import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { useGetCompanyJobByIdQuery } from "@/features/company/services/companyApiCalls"
import { useUpdateJobStatusMutation } from "@/services/shared/jobApiCalls"
import JobDetailsHeader from "@/features/company/components/JobDetails/JobDetailsHeader"
import JobInformation from "@/features/company/components/JobDetails/JobInformation"
import JobDescription from "@/features/company/components/JobDetails/JobDescription"
import ApplicationQuestions from "@/features/company/components/JobDetails/ApplicationQuestions"
import JobTimeline from "@/features/company/components/JobDetails/JobTimeline"
import { Box, Button, Typography } from "@mui/material"
import { CompanyDetailsSkeleton } from "@/features/company/components/CompanySkeletons"
import { showAlert } from "@/utils/swal"
import ReopenJobDialog from "@/features/company/components/JobDetails/ReopenJobDialog"
import { isDateOnOrAfterToday } from "@smart-recruitment/validation"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const JobDetailsPage = () => {
   const navigate = useNavigate()
   const { id, slug } = useParams<{ id: string; slug: string }>()

   const query = useGetCompanyJobByIdQuery(
      { id: id ?? "", slug: slug ?? "" },
      {
         skip: !id || !slug
      }
   )
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"
   const [updateJobStatus, mutationResult] = useUpdateJobStatusMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "action",
      importance: "important"
   })
   const isUpdatingStatus = mutationPresentation.category === "loading"
   const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false)

   const job = response?.data

   if (!id || !slug) {
      return (
         <Box className="flex min-h-125 items-center justify-center">
            <Button className="normal-case!" onClick={() => navigate(-1)}>
               Go Back
            </Button>
         </Box>
      )
   }

   if (isLoading) {
      return <CompanyDetailsSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-125 flex-col items-center justify-center gap-3">
            <Typography
               className="text-sm!"
               aria-live="assertive"
               color="textSecondary"
               role="alert">
               {queryPresentation.message}
            </Typography>

            <Button
               className="normal-case!"
               onClick={query.refetch}>
               Retry
            </Button>
            <Button
               className="mt-5! rounded-lg! px-5! py-2.5! text-sm! font-medium! normal-case! transition!"
               variant="contained"
               onClick={() => navigate(-1)}>
               Go Back
            </Button>
         </Box>
      )
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!job) {
      return (
         <Box className="flex min-h-125 items-center justify-center text-sm text-muted">
            Job details could not be determined.
         </Box>
      )
   }

   const handleEdit = () => {
      navigate(`/company/jobs/${job.id}/${job.slug}/edit`)
   }

   const handleCloseJob = async () => {
      if (
         (job.status === "CLOSED" || job.status === "DRAFT") &&
         !isDateOnOrAfterToday(job.deadline)
      ) {
         setIsReopenDialogOpen(true)
         return
      }

      const nextStatus =
         job.status === "CLOSED" || job.status === "DRAFT" ? "OPEN" : "CLOSED"
      const isClosing = nextStatus === "CLOSED"

      const confirmation = await showAlert({
         type: "confirm",
         title: isClosing ? "Close job?" : "Open job?",
         text: isClosing
            ? "Are you sure you want to close this job?"
            : "Are you sure you want to reopen this job?",
         confirmText: isClosing ? "Close Job" : "Open Job"
      })

      if (!confirmation || !confirmation.isConfirmed) {
         return
      }

      try {
         await updateJobStatus({
            id: job.id,
            status: nextStatus
         }).unwrap()

         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: isClosing ? "Job closed" : "Job opened",
               text: isClosing
                  ? "The job has been closed successfully."
                  : "The job has been reopened successfully."
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "important" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: isClosing ? "Close failed" : "Open failed",
            text: errorPresentation.message
         })
      }
   }

   const handleReopenJob = async (deadline: string) => {
      try {
         await updateJobStatus({
            id: job.id,
            status: "OPEN",
            deadline
         }).unwrap()
         setIsReopenDialogOpen(false)
         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Job reopened",
               text: "The job is open with its new application deadline."
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "important" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Reopen failed",
            text: errorPresentation.message
         })
      }
   }

   const handleManageQuestions = () => {
      navigate(`/company/jobs/${job.id}/${job.slug}/edit?step=questions`)
   }

   return (
      <Box className="min-h-screen">
         {queryPresentation.category === "stale_error" && (
            <Box className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" aria-live="polite" role="status">
               <span>{queryPresentation.message}</span>
               <Button
                  className="normal-case!"
                  onClick={query.refetch}>
                  Retry
               </Button>
            </Box>
         )}
         <JobDetailsHeader
            isUpdating={isUpdatingStatus}
            job={job}
            onCloseJob={handleCloseJob}
            onEdit={handleEdit}
            onReopenJob={() => setIsReopenDialogOpen(true)}
         />

         <Box className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
            {/* Main Content */}
            <main className="space-y-5">
               <JobInformation job={job} />

               <JobDescription
                  description={job.description}
                  skills={job.skills}
               />

               <ApplicationQuestions
                  questions={job.applicationQuestions}
                  onManageQuestions={handleManageQuestions}
               />
            </main>

            {/* Right Sidebar */}
            <aside className="space-y-5">
               <JobTimeline job={job} />
            </aside>
         </Box>
         <ReopenJobDialog
            currentDeadline={job.deadline}
            jobTitle={job.title}
            open={isReopenDialogOpen}
            requireNewDate={job.status === "EXPIRED"}
            onClose={() => setIsReopenDialogOpen(false)}
            onSubmit={handleReopenJob}
         />
      </Box>
   )
}

export default JobDetailsPage
