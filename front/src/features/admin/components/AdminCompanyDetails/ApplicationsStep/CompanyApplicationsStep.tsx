import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button, Typography } from "@mui/material"

import DataTable from "@/components/common/DataTable"
import ApplicationsStats from "@/features/admin/components/applications/ApplicationsStats"
import ApplicationsFilters from "@/features/admin/components/applications/ApplicationsFilters"
import { getCompanyApplicationsColumns } from "./columns"
import { useGetCompanyApplicationsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import type {
   ApplicationStatus,
   StatusCounts
} from "@/types/admin"
import type { ApplicationMatchScore } from "@/types/application"
import { formatDate as formatDateValue } from "@/utils/formatDate"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type CompanyApplicationsStepProps = {
   companyId: string
}

const CompanyApplicationsStep = ({ companyId }: CompanyApplicationsStepProps) => {
   const navigate = useNavigate()
   const [page, setPage] = useState(1)
   const [search, setSearch] = useState("")
   const [debouncedSearch, setDebouncedSearch] = useState("")
   const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL")
   const [matchScore, setMatchScore] = useState<ApplicationMatchScore>("ALL")

   useEffect(() => {
      const timeout = setTimeout(() => {
         setDebouncedSearch(search)
         setPage(1)
      }, 400)

      return () => clearTimeout(timeout)
   }, [search])

   const query = useGetCompanyApplicationsByAdminQuery({
         companyId,
         page,
         search: debouncedSearch || undefined,
         status,
         matchScore
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

   const statusCounts: Partial<StatusCounts> = {
      PENDING: response?.stats.pending ?? 0,
      REVIEWING: response?.stats.reviewing ?? 0,
      SHORTLISTED: response?.stats.shortlisted ?? 0,
      INTERVIEW: response?.stats.interview ?? 0,
      ACCEPTED: response?.stats.accepted ?? 0,
      REJECTED: response?.stats.rejected ?? 0
   }

   const columns = getCompanyApplicationsColumns({
      onView: applicationId => navigate(`/admin/applications/${applicationId}`),
      formatDate: date => formatDateValue(date),
      formatTime: date => formatDateValue(date, { format: "time" })
   })

   const handleStatusChange = (value: ApplicationStatus | "ALL") => {
      setStatus(value)
      setPage(1)
   }

   const handleMatchScoreChange = (value: ApplicationMatchScore) => {
      setMatchScore(value)
      setPage(1)
   }

   return (
      <Box className="w-full space-y-5">
         {isLoading ? (
            <AdminStatsSkeleton
               className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7"
               count={7}
            />
         ) : queryPresentation.category === "section_error" ||
           queryPresentation.category === "access_denied" ||
           queryPresentation.category === "authentication_notice" ||
           queryPresentation.category === "resource_not_found" ? (
            <Typography className="text-sm! text-red-500" aria-live="assertive" role="alert">
               {queryPresentation.message}
            </Typography>
         ) : response?.stats ? (
            <ApplicationsStats
               statusCounts={statusCounts}
               totalCount={response.stats.totalApplications}
            />
         ) : null}
         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" aria-live="polite" role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button className="normal-case!" onClick={query.refetch}>
                  Retry
               </Button>
            </Box>
         )}

         {isLoading ? (
            <FiltersBarSkeleton fields={["search", "control", "control"]} />
         ) : (
            <ApplicationsFilters
               matchScore={matchScore}
               search={search}
               status={status}
               onMatchScoreChange={handleMatchScoreChange}
               onSearchChange={setSearch}
               onStatusChange={handleStatusChange}
            />
         )}

         <DataTable
            columns={columns}
            emptyState={
               <Box className="flex min-h-50 items-center justify-center py-20">
                  <Typography className="text-sm! text-muted">
                     No applications found.
                  </Typography>
               </Box>
            }
            getRowKey={application => application.id}
            isFetching={queryPresentation.category === "refreshing"}
            isLoading={isLoading}
            itemLabel="applications"
            pagination={response?.meta}
            queryState={queryState}
            rows={response?.data ?? []}
            onPageChange={setPage}
            onRetry={query.refetch}
         />
      </Box>
   )
}

export default CompanyApplicationsStep
