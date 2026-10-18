import type { JobStatus } from "@/types/createJob.types"
import { Box } from "@mui/material"
import { useState } from "react"
import { useUpdateJobStatusMutation } from "@/services/shared/jobApiCalls"
import { showAlert } from "@/utils/swal"
import { CompanyTableSkeleton } from "../CompanySkeletons"
import DataTable from "@/components/common/DataTable"
import { getCompanyJobsColumns } from "@/features/company/columns/jobsColumns"
import type { GetCompanyJobsResult } from "@/types/company"
import ReopenJobDialog from "@/features/company/components/JobDetails/ReopenJobDialog"
import { isDateOnOrAfterToday } from "@smart-recruitment/validation"
import type { SemanticQueryState } from "@/utils/queryState"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type CompanyJobRow = GetCompanyJobsResult["data"][number]

type JobsTableProps = {
   jobs: CompanyJobRow[]
   isLoading: boolean
   isFetching: boolean
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const JobsTable = ({
   jobs,
   isLoading,
   isFetching,
   queryState,
   onRetry
}: JobsTableProps) => {
   const [updateJobStatus, mutationResult] = useUpdateJobStatusMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "action",
      importance: "important"
   })
   const [jobToReopen, setJobToReopen] = useState<CompanyJobRow | null>(null)

   const handleToggleJobStatus = async (job: CompanyJobRow) => {
      if (
         job.status === "EXPIRED" ||
         ((job.status === "CLOSED" || job.status === "DRAFT") &&
            !isDateOnOrAfterToday(job.deadline))
      ) {
         setJobToReopen(job)
         return
      }

      const isDraft = job.status === "DRAFT"
      const nextStatus: JobStatus = isDraft
         ? "OPEN"
         : job.status === "CLOSED"
           ? "OPEN"
           : "CLOSED"
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
      if (!jobToReopen) return
      try {
         await updateJobStatus({
            id: jobToReopen.id,
            status: "OPEN",
            deadline
         }).unwrap()
         setJobToReopen(null)
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

   if (isLoading) {
      return <CompanyTableSkeleton />
   }

   if (
      jobs.length === 0 &&
      (queryState?.status === "empty" || queryState?.status === "no_results")
   ) {
      return (
         <Box className="border-border bg-surface rounded-xl border p-14 text-center">
            <Box className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
               <span className="text-xl">•</span>
            </Box>

            <h3 className="text-content mt-4 text-base font-semibold">No jobs found</h3>

            <p className="text-muted mt-1 text-sm">
               Try changing your filters or create a new job.
            </p>
         </Box>
      )
   }

   return (
      <>
         <DataTable
            rows={jobs}
            columns={getCompanyJobsColumns({
               onToggleJobStatus: handleToggleJobStatus,
               isUpdating: mutationPresentation.category === "loading"
            })}
            getRowKey={job => job.id}
            isLoading={isLoading}
            isFetching={isFetching}
            queryState={queryState}
            onRetry={onRetry}
            emptyState={
               <Box className="border-border bg-surface rounded-xl border p-14 text-center">
                  <Box className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
                     <span className="text-xl">•</span>
                  </Box>

                  <h3 className="text-content mt-4 text-base font-semibold">
                     No jobs found
                  </h3>

                  <p className="text-muted mt-1 text-sm">
                     Try changing your filters or create a new job.
                  </p>
               </Box>
            }
            minWidth={1100}
            containerClassName="shadow-none!"
         />
         <ReopenJobDialog
            open={Boolean(jobToReopen)}
            jobTitle={jobToReopen?.title ?? "this job"}
            currentDeadline={jobToReopen?.deadline}
            requireNewDate={jobToReopen?.status === "EXPIRED"}
            onClose={() => setJobToReopen(null)}
            onSubmit={handleReopenJob}
         />
      </>
   )
}

export default JobsTable
