import React, { useState } from "react"

import { Alert, Box } from "@mui/material"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import type {
   CompanyApplication,
   GetCompanyApplicationsParams
} from "@/types/application"
import { useGetApplicationsCompanyQuery } from "@/services/shared/applicationApiCalls"
import ApplicationStats from "@/features/company/components/Applications/ApplicationStats"
import ApplicationsToolbar from "@/features/company/components/Applications/ApplicationsToolbar"
import ApplicationsTable from "@/features/company/components/Applications/ApplicationsTable"
import PageHeader from "@/components/common/PageHeader"
import PaginationFooter from "@/components/common/PaginationFooter"
import ApplicationDetails from "@/features/company/components/Applications/ApplicationDetails/ApplicationDetails"
import {
   CompanyApplicationsSkeleton,
   CompanyApplicationStatsSkeleton
} from "@/features/company/components/CompanySkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const PAGE_SIZE = 7

const ApplicationsPage: React.FC = () => {
   const [page, setPage] = useState(1)
   const [search, setSearch] = useState("")
   const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL")
   const [sort, setSort] = useState<"newest" | "oldest">("newest")
   const [selectedApplication, setSelectedApplication] =
      useState<CompanyApplication | null>(null)
   const params: GetCompanyApplicationsParams = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
      sort
   }

   const query = useGetApplicationsCompanyQuery(params)
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(search.trim()) ||
         status !== "ALL" ||
         sort !== "newest" ||
         (query.currentData?.data.length === 0 &&
            (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   const applications = response?.data ?? []
   const pagination = response?.meta

   const handleSearchChange = (value: string) => {
      setSearch(value)
      setPage(1)
   }

   const handleStatusChange = (value: ApplicationStatus | "ALL") => {
      setStatus(value)
      setPage(1)
   }

   const handleSortChange = (value: "newest" | "oldest") => {
      setSort(value)
      setPage(1)
   }

   return (
      <Box className="min-h-screen">
         <Box className="mx-auto max-w-362.5">
            <PageHeader
               title="Applications"
               description="Review and manage applications received for your job postings."
            />

            {/* Statistics */}
            {isLoading ? (
               <CompanyApplicationStatsSkeleton />
            ) : response ? (
               <ApplicationStats stats={response.stats} />
            ) : queryPresentation.category === "page_error" ||
              queryPresentation.category === "authentication_notice" ||
              queryPresentation.category === "access_denied" ||
              queryPresentation.category === "resource_not_found" ? (
               <Alert
                  severity="error"
                  role="alert"
                  aria-live="assertive">
                  {queryPresentation.message}
               </Alert>
            ) : null}

            {/* Main Content */}
            <Box className="mt-6 overflow-hidden">
               {/* Toolbar */}
               {isLoading ? (
                  <FiltersBarSkeleton fields={["search", "control", "control"]} />
               ) : (
                  <ApplicationsToolbar
                     search={search}
                     status={status}
                     sort={sort}
                     onSearchChange={handleSearchChange}
                     onStatusChange={handleStatusChange}
                     onSortChange={handleSortChange}
                  />
               )}

               <Box
                  className={`mt-6 grid grid-cols-1 gap-4 ${
                     selectedApplication ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""
                  }`}>
                  <Box>
                     <Box className="border-border min-w-0 overflow-hidden rounded-xl border">
                        {/* Loading */}
                        {isLoading ? (
                           <CompanyApplicationsSkeleton />
                        ) : (
                           <ApplicationsTable
                              applications={applications}
                              onViewApplication={setSelectedApplication}
                              queryState={queryState}
                              onRetry={query.refetch}
                           />
                        )}
                     </Box>

                     {pagination && pagination.totalCount > 0 && (
                        <PaginationFooter
                           page={pagination.page}
                           totalCount={pagination.totalCount}
                           pageSize={pagination.pageSize}
                           setPage={setPage}
                           itemLabel="applications"
                           isFetching={queryPresentation.category === "refreshing"}
                           queryState={queryState}
                        />
                     )}
                  </Box>

                  {selectedApplication && (
                     <ApplicationDetails
                        application={selectedApplication}
                        onClose={() => setSelectedApplication(null)}
                     />
                  )}
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default ApplicationsPage
