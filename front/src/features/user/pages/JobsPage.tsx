import React, { useEffect, useState } from "react"
import { Box } from "@mui/material"
import PaginationFooter from "@/components/common/PaginationFooter"
import { useSearchParams } from "react-router-dom"
import { useGetJobsQuery, useToggleSaveJobsMutation } from "@/services/shared/jobApiCalls"
import type { EmploymentType } from "@/types/job"
import { UserJobListSkeleton } from "@/features/user/components/UserSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"
import PageHeader from "@/features/user/components/PageHeader"
import JobsFilters, {
   isEmploymentType
} from "@/features/user/components/jobs/JobsFilters"
import JobListItem from "@/features/user/components/jobs/JobListItem"
const JobsPage: React.FC = () => {
   const [searchParams, setSearchParams] = useSearchParams()

   const searchQuery = searchParams.get("search") || ""
   const employmentTypeParam = searchParams.get("employmentType") || ""
   const employmentType = isEmploymentType(employmentTypeParam)
      ? employmentTypeParam
      : ""
   const page = Number(searchParams.get("page")) || 1

   const [searchInput, setSearchInput] = useState(searchQuery)
   useEffect(() => {
      setSearchInput(searchQuery)
   }, [searchQuery])
   const query = useGetJobsQuery({
      pageNumber: page,
      search: searchQuery,
      employmentType: employmentType || undefined
   })
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults: page > 1 && (query.currentData?.meta?.totalCount ?? 0) > 0
   })
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
   const handleToggleSave = async (jobId: string) => {
      try {
         await toggleSaveJobs({ jobId }).unwrap()
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
   const jobs = response?.data ?? []
   const totalCount = response?.meta?.totalCount ?? 0
   const pageSize = response?.meta?.pageSize ?? 10

   const setPage = (newPage: number) => {
      const params = new URLSearchParams(searchParams)
      params.set("page", String(newPage))
      setSearchParams(params)
   }
   const handleSearch = () => {
      const params = new URLSearchParams(searchParams)
      if (searchInput.trim()) {
         params.set("search", searchInput.trim())
      } else {
         params.delete("search")
      }
      params.set("page", "1")
      setSearchParams(params)
   }
   const handleEmploymentTypeChange = (value: EmploymentType | "") => {
      const params = new URLSearchParams(searchParams)
      if (value) {
         params.set("employmentType", value)
      } else {
         params.delete("employmentType")
      }
      params.set("page", "1")
      setSearchParams(params)
   }
   useEffect(() => {
      window.scrollTo({ top: 0 })
   }, [page])
   return (
      <Box className="min-h-screen font-sans">
         <Box className="mx-auto max-w-7xl">
            <PageHeader
               title="Browse Jobs"
               description="Find the right opportunity for your career"
            />

            <JobsFilters
               search={searchInput}
               employmentType={employmentType}
               onSearchChange={setSearchInput}
               onSearchSubmit={handleSearch}
               onEmploymentTypeChange={handleEmploymentTypeChange}
            />
            {/* JobsPage */}
            <Box className="bg-surface mt-6 overflow-hidden rounded-xl border border-[#edf0f5] shadow-[0_3px_14px_rgba(30,40,70,0.05)]">
               {queryPresentation.category === "stale_error" && (
                  <Box
                     className="border-b border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                     role="status"
                     aria-live="polite">
                     {queryPresentation.message}
                     <button
                        type="button"
                        onClick={query.refetch}
                        className="ml-3 font-semibold">
                        Try again
                     </button>
                  </Box>
               )}
               {isLoading ? (
                  <UserJobListSkeleton />
               ) : queryPresentation.category === "page_error" ||
                 queryPresentation.category === "authentication_notice" ||
                 queryPresentation.category === "access_denied" ||
                 queryPresentation.category === "resource_not_found" ? (
                  <Box
                     className="p-8 text-center text-[#d14343]"
                     role="alert"
                     aria-live="assertive">
                     {queryPresentation.message}
                     <button
                        type="button"
                        onClick={query.refetch}
                        className="mt-3 block w-full font-semibold">
                        Try again
                     </button>
                  </Box>
               ) : queryPresentation.category === "empty" ||
                 queryPresentation.category === "no_results" ? (
                  <Box className="p-8 text-center text-[#687189]">
                     {queryPresentation.category === "no_results"
                        ? "No jobs match your search."
                        : "No jobs are available."}
                  </Box>
               ) : queryPresentation.category === "section_error" ? (
                  <Box
                     className="p-8 text-center text-[#687189]"
                     role="alert"
                     aria-live="assertive">
                     {queryPresentation.message}
                     <button
                        type="button"
                        onClick={query.refetch}
                        className="mt-3 block w-full font-semibold">
                        Try again
                     </button>
                  </Box>
               ) : queryPresentation.category === "silent" &&
                 (queryState.status !== "aborted" ||
                    queryState.data === undefined) ? null : (
                  jobs.map((job, index) => (
                     <JobListItem
                        key={job.id}
                        job={job}
                        isLast={index === jobs.length - 1}
                        isSaving={isSavingJob}
                        onToggleSave={jobId => void handleToggleSave(jobId)}
                     />
                  ))
               )}
            </Box>
            {response && (
               <PaginationFooter
                  page={page}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  setPage={setPage}
                  itemLabel="jobs"
                  isFetching={queryPresentation.category === "refreshing"}
                  queryState={queryState}
               />
            )}
         </Box>
      </Box>
   )
}

export default JobsPage
