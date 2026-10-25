import { useState } from "react"
import { Box } from "@mui/material"
import type { EmploymentType, JobStatus } from "@/types/job"
import type { AdminJob } from "@/types/admin"
import { useGetJobsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import { AdminListSkeleton } from "@/features/admin/components/AdminSkeletons"
import JobsStats from "@/features/admin/components/jobs/JobsStats"
import JobsFilters from "@/features/admin/components/jobs/JobsFilters"
import JobsTable from "@/features/admin/components/jobs/JobsTable"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const JobsPage = () => {
   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [status, setStatus] = useState<"ALL" | JobStatus>("ALL")

   const [employmentType, setEmploymentType] = useState<"ALL" | EmploymentType>("ALL")

   const query = useGetJobsByAdminQuery({
      page,
      search,
      status,
      employmentType
   })

   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(search.trim()) ||
         status !== "ALL" ||
         employmentType !== "ALL" ||
         (query.currentData?.data.length === 0 &&
            (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const jobs: AdminJob[] = response?.data ?? []
   const stats = response?.stats
   const pagination = response?.meta
   const isLoading = queryPresentation.category === "loading"

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

   if (isLoading) {
      return <AdminListSkeleton statCount={4} />
   }

   return (
      <Box className="w-full space-y-6">
         {stats && <JobsStats stats={stats} />}
         <JobsFilters
            employmentType={employmentType}
            search={search}
            status={status}
            onEmploymentTypeChange={handleEmploymentTypeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
         />
         <JobsTable
            isFetching={queryPresentation.category === "refreshing"}
            isLoading={isLoading}
            jobs={jobs}
            pagination={pagination}
            queryState={queryState}
            onPageChange={setPage}
            onRetry={query.refetch}
         />
      </Box>
   )
}

export default JobsPage
