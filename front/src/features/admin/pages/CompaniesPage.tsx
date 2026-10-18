import { useState } from "react"

import { Box, Typography } from "@mui/material"
import { useGetAllCompaniesQuery } from "@/features/admin/services/adminApiCalls"
import { AdminListSkeleton } from "@/features/admin/components/AdminSkeletons"
import PaginationFooter from "@/components/common/PaginationFooter"
import CompaniesFilters from "@/features/admin/components/companies/CompaniesFilters"
import CompaniesGrid from "@/features/admin/components/companies/CompaniesGrid"
import CompaniesStats from "@/features/admin/components/companies/CompaniesStats"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { Button } from "@mui/material"
import {
   emptyLocationSelection,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const CompaniesPage = () => {
   const [page, setPage] = useState(1)

   const [status, setStatus] = useState<"ALL" | "ACTIVE" | "DEACTIVATED">("ALL")

   const [approvalStatus, setApprovalStatus] = useState<
      "ALL" | "PENDING" | "APPROVED" | "REJECTED"
   >("ALL")

   const [sortByNewest, setSortByNewest] = useState(true)
   const [location, setLocation] = useState<LocationSelection>(emptyLocationSelection)

   const query = useGetAllCompaniesQuery({
      page,
      sortByNewest,
      status,
      approvalStatus,
      country: location.countryName || undefined,
      countryCode: location.countryCode || undefined,
      city: location.cityName || undefined,
      cityGeonameId: location.cityGeonameId ?? undefined
   })
   const hasLocationFilter = Boolean(
      location.countryName || location.cityGeonameId
   )
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         (hasLocationFilter && (query.currentData?.meta?.totalCount ?? 0) === 0) ||
         (page > 1 && (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined

   const handleStatusChange = (value: "ALL" | "ACTIVE" | "DEACTIVATED") => {
      setStatus(value)
      setPage(1)
   }

   const handleApprovalStatusChange = (
      value: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
   ) => {
      setApprovalStatus(value)
      setPage(1)
   }

   const handleSortChange = (value: boolean) => {
      setSortByNewest(value)
      setPage(1)
   }

   if (queryPresentation.category === "loading") {
      return (
         <AdminListSkeleton
            statCount={4}
            filterFields={["control", "control", "control"]}
         />
      )
   }

   const companies = response?.data ?? []
   const stats = response?.stats
   const pagination = response?.meta

   return (
      <Box className="min-h-screen">
         <Box className="space-y-6">
            {stats && <CompaniesStats stats={stats} />}

            <CompaniesFilters
               status={status}
               approvalStatus={approvalStatus}
               sortByNewest={sortByNewest}
               location={location}
               onStatusChange={handleStatusChange}
               onApprovalStatusChange={handleApprovalStatusChange}
               onSortChange={handleSortChange}
               onLocationChange={value => {
                  setLocation(value)
                  setPage(1)
               }}
            />

            <Box className="relative">
               {queryPresentation.category === "refreshing" && (
                  <Box className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-violet-600" />
               )}

               {queryPresentation.category === "page_error" ||
               queryPresentation.category === "authentication_notice" ||
               queryPresentation.category === "access_denied" ||
               queryPresentation.category === "resource_not_found" ? (
                  <Box
                     className="flex min-h-100 flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 text-center"
                     role="alert"
                     aria-live="assertive">
                     <Typography className="text-sm! text-red-700!">
                        {queryPresentation.message}
                     </Typography>
                     <Button
                        onClick={query.refetch}
                        className="normal-case!">
                        Try again
                     </Button>
                  </Box>
               ) : queryPresentation.category === "stale_error" ? (
                  <>
                     <Box
                        className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                        role="status"
                        aria-live="polite">
                        <Typography className="text-sm! text-amber-900!">
                           {queryPresentation.message}
                        </Typography>
                        <Button
                           onClick={query.refetch}
                           className="normal-case!">
                           Try again
                        </Button>
                     </Box>
                     {companies.length > 0 ? (
                        <CompaniesGrid companies={companies} />
                     ) : null}
                  </>
               ) : queryPresentation.category === "empty" ||
                 queryPresentation.category === "no_results" ? (
                  <Box className="border-border bg-surface flex min-h-100 flex-col items-center justify-center rounded-xl border">
                     <Typography className="text-content text-lg font-semibold">
                        {queryPresentation.category === "no_results"
                           ? "No companies match the current filters."
                           : "No companies to display"}
                     </Typography>

                     <Typography
                        variant="body2"
                        className="text-muted mt-2">
                        {queryPresentation.category === "no_results"
                           ? "Try adjusting the filters or selecting another page."
                           : "The current company list is empty."}
                     </Typography>
                  </Box>
               ) : queryPresentation.category === "content" ||
                 queryPresentation.category === "refreshing" ||
                 (queryPresentation.category === "silent" &&
                    queryState.status === "aborted" &&
                    queryState.data !== undefined) ? (
                  <CompaniesGrid companies={companies} />
               ) : null}
            </Box>

            {pagination && companies.length > 0 && (
               <PaginationFooter
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalCount={pagination.totalCount}
                  setPage={setPage}
                  itemLabel="companies"
                  isFetching={queryPresentation.category === "refreshing"}
                  queryState={queryState}
               />
            )}
         </Box>
      </Box>
   )
}

export default CompaniesPage
