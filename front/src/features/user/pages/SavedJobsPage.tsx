import React, { useEffect } from "react"
import { Bookmark } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"

import { useGetSaveJobsQuery } from "@/services/shared/jobApiCalls"
import PaginationFooter from "@/components/common/PaginationFooter"
import { useSearchParams } from "react-router-dom"
import SavedJobItem from "@/features/user/components/jobs/SavedJobItem"
import { UserSavedJobsSkeleton } from "@/features/user/components/UserSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { Button } from "@mui/material"
import PageHeader from "@/features/user/components/PageHeader"

// ============================================================
// Component
// ============================================================

const SavedJobsPage: React.FC = () => {
   //    const [page, setPage] = useState(1)
   //    const pageSize = 6
   const [searchParams, setSearchParams] = useSearchParams()
   const page = Number(searchParams.get("page")) || 1
   const query = useGetSaveJobsQuery({
      pageNumber: page
   })
   const noResults =
      (query.currentData?.meta?.totalCount ?? 0) > 0 &&
      (query.currentData?.data.length ?? 0) === 0
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined

   const pageSize = response?.meta?.pageSize ?? 0

   const setPage = (newPage: number) => {
      const params = new URLSearchParams(searchParams)
      params.set("page", String(newPage))
      setSearchParams(params)
   }
   // ============================================================
   // Data
   // ============================================================

   const jobs = response?.data ?? []
   const totalCount = response?.meta?.totalCount ?? 0

   const pagination = {
      ...(response?.meta ?? {
         page: 1,
         pageSize
      }),
      totalCount
   }
   const isLoading = queryPresentation.category === "loading"

   useEffect(() => {
      window.scrollTo({ top: 0 })
   }, [page])

   return (
      <Box className="min-h-screen">
         <Box className="mx-auto max-w-350">
            <PageHeader
               description="Jobs you've saved for later."
               title="Saved Jobs"
               titleAdornment={<Bookmark className="text-[26px]!" />}
            />

            {/* ================================================= */}
            {/* Jobs */}
            {/* ================================================= */}

            <Box className="bg-surface mt-4 overflow-hidden rounded-xl border border-[#e8eaf0] shadow-[0_2px_8px_rgba(25,35,70,0.035)]">
               {/* Loading */}
               {isLoading && <UserSavedJobsSkeleton />}

               {/* Error */}
               {(queryPresentation.category === "page_error" ||
                  queryPresentation.category === "authentication_notice" ||
                  queryPresentation.category === "access_denied" ||
                  queryPresentation.category === "resource_not_found") && (
                  <Box className="flex min-h-75 items-center justify-center">
                     <Box
                        className="text-center"
                        aria-live="assertive"
                        role="alert">
                        <Typography className="text-[15px]! font-semibold! text-[#20263d]!">
                           {queryPresentation.message}
                        </Typography>

                        <Button
                           className="mt-2! normal-case!"
                           onClick={query.refetch}>
                           Try again
                        </Button>
                     </Box>
                  </Box>
               )}

               {queryPresentation.category === "stale_error" && (
                  <Box
                     className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3"
                     aria-live="polite"
                     role="status">
                     <Typography className="text-sm! text-amber-900!">
                        {queryPresentation.message}
                     </Typography>
                     <Button
                        className="normal-case!"
                        onClick={query.refetch}>
                        Try again
                     </Button>
                  </Box>
               )}

               {/* Empty */}
               {(queryPresentation.category === "empty" ||
                  queryPresentation.category === "no_results") && (
                  <Box className="flex min-h-87.5 flex-col items-center justify-center px-6 text-center">
                     <Box className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f1edff]">
                        <Bookmark className="text-[28px]! text-[#5521ed]!" />
                     </Box>

                     <Typography
                        className="mt-4! text-[17px]! font-semibold!"
                        variant="h3">
                        {queryPresentation.category === "no_results"
                           ? "No saved jobs on this page"
                           : "No saved jobs"}
                     </Typography>

                     <Typography className="mt-1! max-w-87.5! text-[13px]! text-[#7c8499]!">
                        {queryPresentation.category === "no_results"
                           ? "Try selecting a different page."
                           : "Jobs you save will appear here so you can easily find them later."}
                     </Typography>
                  </Box>
               )}

               {/* Job rows */}
               {(queryPresentation.category === "content" ||
                  queryPresentation.category === "refreshing" ||
                  (queryPresentation.category === "stale_error" &&
                     queryPresentation.preserveContent) ||
                  (queryState.status === "aborted" && queryState.data !== undefined)) &&
                  jobs.map(job => (
                     <SavedJobItem
                        key={job.id}
                        job={job}
                     />
                  ))}
            </Box>

            {/* ================================================= */}
            {/* Footer / Pagination */}
            {/* ================================================= */}

            {response && pagination.totalCount > 0 && (
               <PaginationFooter
                  isFetching={queryPresentation.category === "refreshing"}
                  itemLabel="jobs"
                  page={page}
                  pageSize={pageSize}
                  queryState={queryState}
                  setPage={setPage}
                  totalCount={totalCount}
               />
            )}
         </Box>
      </Box>
   )
}

export default SavedJobsPage
