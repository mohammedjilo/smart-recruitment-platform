import { useState } from "react"
import { useParams } from "react-router-dom"

import { Box, Button, Typography } from "@mui/material"
import CompanyDetailsSkeleton from "@/features/admin/components/AdminCompanyDetails/CompanyDetailsSkeleton"
import { useGetCompanyDetailsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import CompanyDetailsHeader from "@/features/admin/components/AdminCompanyDetails/CompanyDetailsHeader"
import CompanyTabs from "@/features/admin/components/AdminCompanyDetails/CompanyTabs"
import CompanyOverview from "@/features/admin/components/AdminCompanyDetails/CompanyOverview"
import JobsStep from "@/features/admin/components/AdminCompanyDetails/JobsStep/JobsStep"
import CompanyApplicationsStep from "@/features/admin/components/AdminCompanyDetails/ApplicationsStep/CompanyApplicationsStep"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const CompanyDetailsPage = () => {
   const { id } = useParams<{ id: string }>()

   const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "applications">(
      "overview"
   )
   const { hasPermission } = usePermissions()
   const canViewApplications = hasPermission(ADMIN_PERMISSIONS.VIEW_APPLICATIONS)

   const query = useGetCompanyDetailsByAdminQuery(id ?? "", {
      skip: !id
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <CompanyDetailsSkeleton />
   }
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-125 items-center justify-center">
            <Box className="text-center">
               <Typography className="text-lg font-semibold text-red-600">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="mt-3! normal-case!">
                  Retry
               </Button>
            </Box>
         </Box>
      )
   }

   if (!response?.data) {
      return (
         <Box className="flex min-h-125 items-center justify-center text-center">
            <Typography className="text-sm! text-muted!">
               Company details could not be determined.
            </Typography>
         </Box>
      )
   }

   const { company, stats, recentJobs } = response.data

   return (
      <Box className="min-h-screen bg-[#fafbff]">
         <Box>
            {queryPresentation.category === "stale_error" && (
               <Box className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
                  <Typography className="text-sm! text-amber-900!">
                     {queryPresentation.message}
                  </Typography>
                  <Button onClick={query.refetch} className="normal-case!">
                     Retry
                  </Button>
               </Box>
            )}
            <CompanyDetailsHeader company={company} />

            <CompanyTabs
               activeTab={activeTab}
               totalJobs={stats.totalJobs}
               totalApplications={stats.totalApplications}
               showApplications={canViewApplications}
               onChange={setActiveTab}
            />

            {activeTab === "overview" && (
               <CompanyOverview
                  company={company}
                  stats={stats}
                  recentJobs={recentJobs}
               />
            )}

            {activeTab === "jobs" && <JobsStep companyId={id!} />}

            {activeTab === "applications" && canViewApplications && (
               <CompanyApplicationsStep companyId={id!} />
            )}
         </Box>
      </Box>
   )
}

export default CompanyDetailsPage
