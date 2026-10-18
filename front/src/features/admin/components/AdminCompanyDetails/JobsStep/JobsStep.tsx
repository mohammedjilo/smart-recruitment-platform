import { useState } from "react"
import { Box, Button, Typography } from "@mui/material"

import JobsStats from "./JobsStats"
import JobsFilters from "./JobsFilters"
import type { EmploymentType, JobStatus } from "@/types/job"
import type { CompanyJob } from "@/types/admin"
import { useGetCompanyJobsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import JobsTable from "./JobsTable"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type JobsStepProps = {
   companyId: string
}

const JobsStep = ({ companyId }: JobsStepProps) => {
   const [page, setPage] = useState(1)
   const [search, setSearch] = useState("")
   const [status, setStatus] = useState<"ALL" | JobStatus>("ALL")
   const [employmentType, setEmploymentType] = useState<"ALL" | EmploymentType>("ALL")

   const query = useGetCompanyJobsByAdminQuery({
      id: companyId,
      page,
      search,
      status,
      employmentType
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

   const jobs: CompanyJob[] = response?.data ?? []
   const stats = response?.stats
   const pagination = response?.meta

   const handleSearchChange = (value: string) => {
      setSearch(value)
      setPage(1)
   }

   const handleStatusChange = (value: "ALL" | JobStatus) => {
      setStatus(value)
      setPage(1)
   }

   const handleEmploymentTypeChange = (value: "ALL" | EmploymentType) => {
      setEmploymentType(value)
      setPage(1)
   }

   return (
      <Box className="w-full space-y-5">
         {isLoading ? (
            <AdminStatsSkeleton count={4} />
         ) : queryPresentation.category === "section_error" ||
           queryPresentation.category === "access_denied" ||
           queryPresentation.category === "authentication_notice" ||
           queryPresentation.category === "resource_not_found" ? (
            <Typography className="text-sm! text-red-500" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
         ) : stats ? (
            <JobsStats stats={stats} />
         ) : null}
         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         {isLoading ? (
            <FiltersBarSkeleton fields={["search", "control", "control"]} />
         ) : (
            <JobsFilters
               search={search}
               status={status}
               employmentType={employmentType}
               onSearchChange={handleSearchChange}
               onStatusChange={handleStatusChange}
               onEmploymentTypeChange={handleEmploymentTypeChange}
            />
         )}
         <JobsTable
            jobs={jobs}
            isLoading={isLoading}
            isFetching={queryPresentation.category === "refreshing"}
            pagination={pagination}
            onPageChange={setPage}
            queryState={queryState}
            onRetry={query.refetch}
         />
      </Box>
   )
}

export default JobsStep
