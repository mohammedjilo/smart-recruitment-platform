import { Box, Typography } from "@mui/material"

import { useState } from "react"

import { useGetJobApplicationsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import ApplicationsFilters from "./ApplicationsFilters"
import type {
   ExperienceFilter,
   JobApplication
} from "@/types/admin"
import type { ApplicationMatchScore } from "@/types/application"
import type { ApplicationStatus } from "@/features/user/components/dashboard/RecentApplicationItem"
import ApplicationsHeader from "./ApplicationsHeader"
import ApplicationsTable from "./ApplicationsTable"
import ApplicationsStats from "./JobApplicationsStats"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import ApplicationsStepHeaderSkeleton from "./ApplicationsStepHeaderSkeleton"

type ApplicationsStepProps = {
   jobId: string
}

const ApplicationsStep = ({ jobId }: ApplicationsStepProps) => {
   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL")

   const [experience, setExperience] = useState<ExperienceFilter>("ALL")
   const [matchScore, setMatchScore] =
      useState<ApplicationMatchScore>("ALL")

   const query = useGetJobApplicationsByAdminQuery({
      id: jobId,
      page,
      search,
      status,
      experience,
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

   const handleMatchScoreChange = (value: ApplicationMatchScore) => {
      setMatchScore(value)
      setPage(1)
   }

   return (
      <Box className="w-full">
         {pagination ? (
            <ApplicationsHeader totalApplications={pagination.totalCount} />
         ) : isLoading ? (
            <ApplicationsStepHeaderSkeleton />
         ) : null}

         <Box className="mt-5">
            {isLoading ? (
               <AdminStatsSkeleton
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8"
                  count={8}
               />
            ) : queryPresentation.category === "section_error" ||
              queryPresentation.category === "access_denied" ||
              queryPresentation.category === "authentication_notice" ||
              queryPresentation.category === "resource_not_found" ? (
               <Typography className="text-sm! text-red-500" aria-live="assertive" role="alert">
                  {queryPresentation.message}
               </Typography>
            ) : stats ? (
               <ApplicationsStats stats={stats} />
            ) : null}
         </Box>

         <Box className="mt-5">
            {isLoading ? (
               <FiltersBarSkeleton fields={["search", "control", "control", "control"]} />
            ) : (
               <ApplicationsFilters
                  experience={experience}
                  matchScore={matchScore}
                  search={search}
                  status={status}
                  onExperienceChange={handleExperienceChange}
                  onMatchScoreChange={handleMatchScoreChange}
                  onSearchChange={handleSearchChange}
                  onStatusChange={handleStatusChange}
               />
            )}
         </Box>

         <Box className="mt-4">
            <ApplicationsTable
               applications={applications}
               isFetching={queryPresentation.category === "refreshing"}
               isLoading={isLoading}
               pagination={pagination}
               queryState={queryState}
               onPageChange={setPage}
               onRetry={query.refetch}
            />
         </Box>
      </Box>
   )
}

export default ApplicationsStep
