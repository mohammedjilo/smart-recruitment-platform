import React, { useEffect, useMemo, useState } from "react"
import { Box, Paper, Typography } from "@mui/material"
import { skipToken } from "@reduxjs/toolkit/query"

import {
   useGetMyApplicationDetailsQuery,
   useGetMyApplicationsQuery
} from "@/services/shared/applicationApiCalls"
import { ApplicationDetails } from "@/features/user/components/application/ApplicationDetails/ApplicationDetails"
import Statistics, {
   type Application
} from "@/features/user/components/application/Statistics"
import PaginationFooter from "@/components/common/PaginationFooter"
import { useSearchParams } from "react-router-dom"
import ApplicationItem from "@/features/user/components/application/ApplicationItem"
import ApplicationsLoadingState from "@/features/user/components/application/ApplicationsLoadingState"
import ApplicationsErrorState from "@/features/user/components/application/ApplicationsErrorState"
import ApplicationsEmptyState from "@/features/user/components/application/ApplicationsEmptyState"
import ApplicationsFilters, {
   isApplicationMatchScore,
   isApplicationStatus,
   type ApplicationMatchScore,
   type ApplicationSort
} from "@/features/user/components/application/ApplicationsFilters"
import type { ApplicationStatus } from "@/types/common/enums"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import PageHeader from "@/components/common/PageHeader"

/* =========================================================
   Main Component
========================================================= */

const ApplicationsPage: React.FC = () => {
   const [searchParams, setSearchParams] = useSearchParams()
   const page = Number(searchParams.get("page")) || 1
   const search = searchParams.get("search") ?? ""
   const statusParam = searchParams.get("status") ?? "ALL"
   const status: ApplicationStatus | "ALL" =
      statusParam === "ALL" || isApplicationStatus(statusParam) ? statusParam : "ALL"
   const matchScoreParam = searchParams.get("matchScore") ?? "ALL"
   const matchScore: ApplicationMatchScore = isApplicationMatchScore(matchScoreParam)
      ? matchScoreParam
      : "ALL"
   const sortParam = searchParams.get("sort") ?? "newest"
   const sort: ApplicationSort = sortParam === "oldest" ? "oldest" : "newest"
   const query = useGetMyApplicationsQuery({
      page,
      pageSize: 5,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
      matchScore: matchScore === "ALL" ? undefined : matchScore,
      sortOrder: sort === "newest" ? "desc" : "asc"
   })
   const queryState = getQueryState(query, {
      isEmpty: response => !Array.isArray(response?.data) || response.data.length === 0,
      noResults:
         (Boolean(search) ||
            status !== "ALL" ||
            matchScore !== "ALL" ||
            sort !== "newest" ||
            page > 1) &&
         (query.currentData?.meta?.totalCount ?? 0) > 0
   })
   const queryPresentation = getQueryPresentation(queryState, "page")

   const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
   const applicationDetailsQuery = useGetMyApplicationDetailsQuery(
      selectedApplicationId ?? skipToken
   )

   const setPage = (newPage: number) => {
      const params = new URLSearchParams(searchParams)
      params.set("page", String(newPage))
      setSearchParams(params)
   }
   const updateFilter = (key: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value && value !== "ALL" && value !== "newest") {
         params.set(key, value)
      } else {
         params.delete(key)
      }
      params.set("page", "1")
      setSearchParams(params)
      setSelectedApplicationId(null)
   }
   /* =====================================================
      Normalize API Response
   ===================================================== */

   const applications: Application[] = useMemo(() => {
      if (!("data" in queryState)) return []
      if (Array.isArray(queryState.data?.data)) {
         return queryState.data.data
      }
      return []
   }, [queryState])

   const response = "data" in queryState ? queryState.data : undefined
   const pagination = response?.meta ?? response?.pagination
   const totalCount = pagination?.totalCount ?? applications.length
   const pageSize = pagination?.pageSize ?? 5

   useEffect(() => {
      window.scrollTo({ top: 0 })
   }, [page])
   /* =====================================================
      Select Application
   ===================================================== */

   const handleSelectApplication = (application: Application) => {
      setSelectedApplicationId(application.id)
   }

   /* =====================================================
      Loading
   ===================================================== */

   if (queryPresentation.category === "loading") {
      return <ApplicationsLoadingState />
   }

   /* =====================================================
      Error
   ===================================================== */

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <ApplicationsErrorState
            message={queryPresentation.message}
            onRetry={query.refetch}
         />
      )
   }

   return (
      <Box className="min-h-full">
         <PageHeader
            description="Track the status of your job applications and view match insights."
            title="My Applications"
         />
         {/* =================================================
             Statistics
         ================================================= */}
         <Statistics applications={applications} />
         <ApplicationsFilters
            matchScore={matchScore}
            search={search}
            sort={sort}
            status={status}
            onMatchScoreChange={value => updateFilter("matchScore", value)}
            onSearchSubmit={submittedSearch => {
               const params = new URLSearchParams(searchParams)
               if (submittedSearch.trim()) {
                  params.set("search", submittedSearch.trim())
               } else {
                  params.delete("search")
               }
               params.set("page", "1")
               setSearchParams(params)
               setSelectedApplicationId(null)
            }}
            onSortChange={value => updateFilter("sort", value)}
            onStatusChange={value => updateFilter("status", value)}
         />
         {queryPresentation.category === "stale_error" && (
            <Box
               className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               aria-live="polite"
               role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <button
                  className="text-sm font-semibold text-amber-900"
                  type="button"
                  onClick={query.refetch}>
                  Try again
               </button>
            </Box>
         )}

         {/* =================================================
             Main Content
         ================================================= */}

         <Box
            className={`mt-6 grid gap-4 ${
               selectedApplicationId
                  ? "grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.75fr)]"
                  : "grid-cols-1"
            } `}>
            <Box className="space-y-6">
               {/* =================================================
                   ApplicationsPage List
               ================================================= */}

               <Paper
                  className="bg-surface! overflow-hidden rounded-xl! border! border-[#E7EAF0]!"
                  elevation={0}>
                  <Box className="border-b border-[#E7EAF0] px-5 py-4">
                     <Typography className="font-semibold! text-[#17213B]!">
                        All ApplicationsPage
                     </Typography>
                  </Box>

                  {/* Table Header */}

                  <Box className="hidden grid-cols-[minmax(220px,1.5fr)_120px_130px_130px_30px] gap-4 border-b border-[#E7EAF0] bg-[#FCFCFD] px-5 py-3 md:grid">
                     <Typography className="text-xs! font-semibold! text-[#64748B]!">
                        Job
                     </Typography>

                     <Typography className="text-xs! font-semibold! text-[#64748B]!">
                        Match Score
                     </Typography>

                     <Typography className="text-xs! font-semibold! text-[#64748B]!">
                        Status
                     </Typography>

                     <Typography className="text-xs! font-semibold! text-[#64748B]!">
                        Applied On
                     </Typography>

                     <span />
                  </Box>

                  {/* ApplicationsPage */}

                  {queryPresentation.category === "empty" ||
                  queryPresentation.category === "no_results" ? (
                     <ApplicationsEmptyState />
                  ) : queryPresentation.category === "content" ||
                    queryPresentation.category === "refreshing" ||
                    (queryPresentation.category === "stale_error" &&
                       queryPresentation.preserveContent) ||
                    (queryPresentation.category === "silent" &&
                       queryState.status === "aborted" &&
                       queryState.data !== undefined) ? (
                     <Box>
                        {applications.map(application => {
                           const selected = selectedApplicationId === application.id

                           return (
                              <ApplicationItem
                                 key={application.id}
                                 application={application}
                                 handleSelectApplication={handleSelectApplication}
                                 selected={selected}
                              />
                           )
                        })}
                     </Box>
                  ) : queryPresentation.category === "silent" ? null : (
                     <Box className="p-8 text-center">
                        <Typography className="text-sm!" color="textSecondary">
                           {queryPresentation.message ??
                              "Unable to determine the current applications."}
                        </Typography>
                     </Box>
                  )}
               </Paper>

               {/* =================================================
                   Pagination
               ================================================= */}
               <PaginationFooter
                  isFetching={queryPresentation.category === "refreshing"}
                  itemLabel="applications"
                  page={page}
                  pageSize={pageSize}
                  queryState={queryState}
                  setPage={setPage}
                  totalCount={totalCount}
               />
            </Box>

            {/* =================================================
                Application Details
            ================================================= */}

            {selectedApplicationId &&
            applicationDetailsQuery.isFetching &&
            !applicationDetailsQuery.currentData ? (
               <Paper
                  className="bg-surface! h-fit rounded-xl! border! border-[#E7EAF0]! p-6"
                  elevation={0}>
                  <Typography className="text-sm! text-[#64748B]!">
                     Loading application details...
                  </Typography>
               </Paper>
            ) : selectedApplicationId && applicationDetailsQuery.isError ? (
               <Paper
                  className="bg-surface! h-fit rounded-xl! border! border-[#E7EAF0]! p-6"
                  elevation={0}
                  role="alert">
                  <Typography className="text-sm! text-[#B42318]!">
                     Could not load this application’s details.
                  </Typography>
                  <button
                     className="mt-3 text-sm font-semibold text-[#6741E8]"
                     type="button"
                     onClick={() => void applicationDetailsQuery.refetch()}>
                     Try again
                  </button>
               </Paper>
            ) : selectedApplicationId && applicationDetailsQuery.currentData ? (
               <ApplicationDetails
                  application={applicationDetailsQuery.currentData.data}
                  onClose={() => setSelectedApplicationId(null)}
               />
            ) : null}
         </Box>
      </Box>
   )
}

export default ApplicationsPage
