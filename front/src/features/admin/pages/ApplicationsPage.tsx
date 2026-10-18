import { Box, CircularProgress } from "@mui/material"

import { useEffect, useState } from "react"

import { useNavigate } from "react-router-dom"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import type { AdminApplication } from "@/types/admin"
import { useGetApplicationsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import ApplicationsStats from "@/features/admin/components/applications/ApplicationsStats"
import ApplicationsFilters from "@/features/admin/components/applications/ApplicationsFilters"
import ApplicationsTable from "@/features/admin/components/applications/ApplicationsTable"
import { AdminListSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const ApplicationsPage = () => {
   const navigate = useNavigate()

   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [debouncedSearch, setDebouncedSearch] = useState("")

   const [status, setStatus] = useState<Partial<ApplicationStatus> | "ALL">("ALL")

   /*
    * Debounce Search
    */
   useEffect(() => {
      const timeout = setTimeout(() => {
         setDebouncedSearch(search)
         setPage(1)
      }, 400)

      return () => clearTimeout(timeout)
   }, [search])

   const query = useGetApplicationsByAdminQuery({
      page,
      search: debouncedSearch || undefined,
      status
   })
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(debouncedSearch.trim()) ||
         status !== "ALL" ||
         (query.currentData?.data.length === 0 &&
            (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const applications: AdminApplication[] = response?.data ?? []

   const pagination = response?.meta

   const statusCounts = response?.stats ?? {
      PENDING: 0,
      REVIEWING: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0
   }

   const totalCount = pagination?.totalCount || 0
   const isLoading = queryPresentation.category === "loading"

   const handleStatusChange = (value: ApplicationStatus | "ALL") => {
      setStatus(value)
      setPage(1)
   }

   const handleViewApplication = (applicationId: string) => {
      navigate(`/admin/applications/${applicationId}`)
   }

   if (isLoading) {
      return (
         <AdminListSkeleton
            statCount={7}
            filterFields={["search", "control"]}
         />
      )
   }

   return (
      <Box className="w-full space-y-6">
         {/* Statistics */}
         {response && (
            <ApplicationsStats
               totalCount={totalCount}
               statusCounts={statusCounts}
            />
         )}

         {/* Filters */}
         <ApplicationsFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={handleStatusChange}
         />

         {/* ApplicationsPage Section */}
         <Box className="overflow-hidden rounded-xl">
            <Box className="flex items-center justify-between px-5 py-4">
               {queryPresentation.category === "refreshing" && <CircularProgress size={18} />}
            </Box>

            <ApplicationsTable
               applications={applications}
               onView={handleViewApplication}
               isLoading={isLoading}
               isFetching={queryPresentation.category === "refreshing"}
               queryState={queryState}
               onRetry={query.refetch}
               pagination={pagination}
               onPageChange={setPage}
            />
         </Box>
      </Box>
   )
}

export default ApplicationsPage
