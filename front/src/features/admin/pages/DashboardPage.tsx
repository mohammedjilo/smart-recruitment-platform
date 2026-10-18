import { Box, Button, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useGetAdminDashboardQuery } from "@/features/admin/services/adminApiCalls"
import { AdminDashboardSkeleton } from "@/features/admin/components/AdminSkeletons"
import DashboardStats from "@/features/admin/components/dashboard/DashboardStats"
import CompanyRequests from "@/features/admin/components/dashboard/CompanyRequests"
import LatestJobs from "@/features/admin/components/dashboard/LatestJobs"
import TopCompanies from "@/features/admin/components/dashboard/TopCompanies"
import TopJobs from "@/features/admin/components/dashboard/TopJobs"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

export default function DashboardPage() {
   const navigate = useNavigate()
   const query = useGetAdminDashboardQuery()
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"
   const { hasPermission } = usePermissions()

   if (isLoading) {
      return <AdminDashboardSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-100 flex-col items-center justify-center gap-3">
            <Typography className="text-sm! text-red-500!" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button onClick={query.refetch} className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }

   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!response?.data) {
      return (
         <Box className="p-8 text-center">
            <Typography className="text-sm! text-muted!">
               Dashboard data could not be determined.
            </Typography>
         </Box>
      )
   }

   const dashboard = response.data

   return (
      <Box className="space-y-5">
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
         {/* Statistics */}
         <DashboardStats stats={dashboard.stats} />

         {/* Permission-aware resource widgets */}
         {(hasPermission(ADMIN_PERMISSIONS.VIEW_COMPANIES) ||
            hasPermission(ADMIN_PERMISSIONS.VIEW_JOBS)) && (
            <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
               {hasPermission(ADMIN_PERMISSIONS.VIEW_COMPANIES) && (
                  <CompanyRequests
                     requests={dashboard.companyRequests}
                     onViewAll={() => navigate("/admin/company-requests")}
                  />
               )}

               {hasPermission(ADMIN_PERMISSIONS.VIEW_JOBS) && (
                  <LatestJobs
                     jobs={dashboard.latestJobs}
                     onViewAll={() => navigate("/admin/jobs")}
                  />
               )}
            </Box>
         )}

         {/* Top Companies + Top Jobs */}
         {(hasPermission(ADMIN_PERMISSIONS.VIEW_COMPANIES) ||
            hasPermission(ADMIN_PERMISSIONS.VIEW_JOBS)) && (
            <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
               {hasPermission(ADMIN_PERMISSIONS.VIEW_COMPANIES) && (
                  <TopCompanies companies={dashboard.topCompaniesByJobs} />
               )}

               {hasPermission(ADMIN_PERMISSIONS.VIEW_JOBS) &&
                  hasPermission(ADMIN_PERMISSIONS.VIEW_APPLICATIONS) && (
                     <TopJobs jobs={dashboard.topJobsByApplications} />
                  )}
            </Box>
         )}
      </Box>
   )
}
