import { useState } from "react"

import { Box, Button, Typography } from "@mui/material"

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import type { JobStatus } from "@/types/user"
import { useGetCompanyJobsForUserQuery } from "@/features/user/services/userApiCalls"
import PaginationFooter from "@/components/common/PaginationFooter"
import CompanyJobsFilters from "./CompanyJobsFilters"
import CompanyJobsList from "./CompanyJobsList"
import { UserCompanyJobsSkeleton } from "@/features/user/components/UserSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type Props = {
   companyId: string
}

const JobsTap = ({ companyId }: Props) => {
   const [page, setPage] = useState(1)
   const [search, setSearch] = useState("")
   const [status, setStatus] = useState<JobStatus | "ALL">("ALL")

   const query = useGetCompanyJobsForUserQuery({
      companyId,
      pageNumber: page,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status
   })
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         (query.currentData?.meta?.totalCount ?? 0) > 0 &&
         query.currentData?.data.length === 0
   })
   const queryPresentation = getQueryPresentation(queryState, "section")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   const jobs = response?.data ?? []
   const pagination = response?.meta

   const handleSearchChange = (value: string) => {
      setSearch(value)
      setPage(1)
   }

   const handleStatusChange = (value: JobStatus | "ALL") => {
      setStatus(value)
      setPage(1)
   }

   return (
      <Box>
         <Box className="mb-5">
            <Typography className="text-content text-lg font-bold">
               Jobs
               {pagination && (
                  <Typography
                     component="span"
                     className="ml-1 text-lg font-bold"
                     color="textSecondary">
                     ({pagination.totalCount})
                  </Typography>
               )}
            </Typography>
         </Box>

         {isLoading ? (
            <FiltersBarSkeleton
               responsiveAt="sm"
               fields={["search", "control"]}
               className="justify-between"
            />
         ) : (
            <CompanyJobsFilters
               search={search}
               status={status}
               onSearchChange={handleSearchChange}
               onStatusChange={handleStatusChange}
            />
         )}

         {isLoading && (
            <Box className="mt-6">
               <UserCompanyJobsSkeleton />
            </Box>
         )}

         {(queryPresentation.category === "section_error" ||
            queryPresentation.category === "access_denied" ||
            queryPresentation.category === "authentication_notice" ||
            queryPresentation.category === "resource_not_found") && (
            <Box className="border-border bg-surface mt-6 flex min-h-87.5 flex-col items-center justify-center rounded-xl border px-6 text-center" role="alert" aria-live="assertive">
               <ErrorOutlineOutlinedIcon
                  className="mb-3 text-red-400"
                  sx={{ fontSize: 42 }}
               />

               <Typography className="text-content text-base font-semibold">
                  Failed to load jobs
               </Typography>

               <Typography
                  className="mt-2 text-sm"
                  color="textSecondary">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="mt-3! normal-case!">
                  Retry
               </Button>
            </Box>
         )}

         {queryPresentation.category === "stale_error" && (
            <Box className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         {(queryPresentation.category === "content" ||
            queryPresentation.category === "empty" ||
            queryPresentation.category === "no_results" ||
            queryPresentation.category === "refreshing" ||
            (queryPresentation.category === "stale_error" &&
               jobs.length > 0) ||
            (queryPresentation.category === "silent" &&
               queryState.status === "aborted" &&
               queryState.data !== undefined)) && (
            <>
               <Box className="mt-6">
                  <CompanyJobsList
                     jobs={jobs}
                     hasFilters={Boolean(search.trim()) || status !== "ALL"}
                  />

                  {pagination && pagination.totalCount > 0 && (
                     <PaginationFooter
                        totalCount={pagination.totalCount}
                        pageSize={pagination.pageSize}
                        page={page}
                        setPage={setPage}
                        itemLabel="jobs"
                        isFetching={queryPresentation.category === "refreshing"}
                        queryState={queryState}
                     />
                  )}
               </Box>
            </>
         )}
         {queryPresentation.category === "section_error" && (
            <Box className="mt-6 flex min-h-87.5 items-center justify-center rounded-xl border border-border bg-surface px-6 text-center" role="alert" aria-live="assertive">
               <Typography className="text-sm! text-muted!">
                  {queryPresentation.message}
               </Typography>
            </Box>
         )}
         {queryPresentation.category === "silent" &&
            (queryState.status !== "aborted" || queryState.data === undefined) && null}
      </Box>
   )
}

export default JobsTap
