import { Box, Skeleton, Typography } from "@mui/material"

import { useState } from "react"

import { useGetJobApplicationsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import ApplicationsFilters from "./ApplicationsFilters"
import type { ExperienceFilter, JobApplication } from "@/types/admin"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import ApplicationsHeader from "./ApplicationsHeader"
import ApplicationsTable from "./ApplicationsTable"
import ApplicationsStats from "./JobApplicationsStats"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type ApplicationsStepProps = {
   jobId: string
}

const ApplicationsStep = ({ jobId }: ApplicationsStepProps) => {
   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL")

   const [experience, setExperience] = useState<ExperienceFilter>("ALL")

   const query = useGetJobApplicationsByAdminQuery({
      id: jobId,
      page,
      search,
      status,
      experience
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

   const applications: JobApplication[] = response?.data ?? []
   const pagination = response?.meta
   const stats = response?.stats

   const handleSearchChange = (value: string) => {
      setSearch(value)
      setPage(1)
   }

   const handleStatusChange = (value: ApplicationStatus | "ALL") => {
      setStatus(value)
      setPage(1)
   }

   const handleExperienceChange = (value: ExperienceFilter) => {
      setExperience(value)
      setPage(1)
   }

   return (
      <Box className="w-full">
         {pagination ? (
            <ApplicationsHeader totalApplications={pagination.totalCount} />
         ) : isLoading ? (
            <Box className="space-y-2">
               <Skeleton
                  width={260}
                  height={32}
               />
               <Skeleton width={320} />
            </Box>
         ) : null}

         <Box className="mt-5">
            {isLoading ? (
               <AdminStatsSkeleton
                  count={8}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8"
               />
            ) : queryPresentation.category === "section_error" ||
              queryPresentation.category === "access_denied" ||
              queryPresentation.category === "authentication_notice" ||
              queryPresentation.category === "resource_not_found" ? (
               <Typography className="text-sm! text-red-500" role="alert" aria-live="assertive">
                  {queryPresentation.message}
               </Typography>
            ) : stats ? (
               <ApplicationsStats stats={stats} />
            ) : null}
         </Box>

         <Box className="mt-5">
            {isLoading ? (
               <FiltersBarSkeleton fields={["search", "control", "control"]} />
            ) : (
               <ApplicationsFilters
                  search={search}
                  status={status}
                  experience={experience}
                  onSearchChange={handleSearchChange}
                  onStatusChange={handleStatusChange}
                  onExperienceChange={handleExperienceChange}
               />
            )}
         </Box>

         <Box className="mt-4">
            <ApplicationsTable
               applications={applications}
               isLoading={isLoading}
               isFetching={queryPresentation.category === "refreshing"}
               pagination={pagination}
               onPageChange={setPage}
               queryState={queryState}
               onRetry={query.refetch}
            />
         </Box>
      </Box>
   )
}

export default ApplicationsStep
