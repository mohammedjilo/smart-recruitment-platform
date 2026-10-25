import { Box, Button, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { lazy } from "react"
import CompanyLayout from "@/layouts/CompanyLayout"
import UserLayout from "@/layouts/UserLayout"
import type { RootState } from "@/redux/store"
import { useGetCurrentAdminPermissionsQuery } from "@/features/admin/services/adminApiCalls"
import AdminWorkspaceRedirect from "@/features/admin/components/AdminWorkspaceRedirect"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import RoutePage from "./RoutePage"

const CompanyDashboard = lazy(() => import("@/features/company/pages/DashboardPage"))
const UserDashboard = lazy(() => import("@/features/user/pages/DashboardPage"))

const DashboardRoute = () => {
   const user = useSelector((state: RootState) => state.auth.user)
   const company = useSelector((state: RootState) => state.auth.company)
   const isAdmin = user?.role === "ADMIN"
   const permissionsQuery = useGetCurrentAdminPermissionsQuery(user?.id ?? "", {
      skip: !isAdmin || !user?.id
   })
   const permissionsState = getQueryState(permissionsQuery)
   const permissionsPresentation = getQueryPresentation(permissionsState, "page")
   if (user?.role === "ADMIN") {
      if (permissionsPresentation.category === "loading") {
         return <Box className="text-muted p-6 text-sm">Loading permissions...</Box>
      }
      if (
         permissionsPresentation.category === "page_error" ||
         permissionsPresentation.category === "stale_error" ||
         permissionsPresentation.category === "authentication_notice" ||
         permissionsPresentation.category === "access_denied" ||
         permissionsPresentation.category === "resource_not_found" ||
         permissionsState.status === "idle"
      ) {
         return (
            <Box className="space-y-3 p-6">
               <Typography
                  className="text-sm! text-red-600!"
                  aria-live="assertive"
                  role="alert">
                  {permissionsPresentation.category === "page_error" &&
                  permissionsState.status === "inconsistent"
                     ? "Admin permissions could not be verified."
                     : permissionsPresentation.message}
               </Typography>
               <Button
                  className="normal-case!"
                  onClick={() => void permissionsQuery.refetch()}>
                  Retry
               </Button>
            </Box>
         )
      }
      if (permissionsPresentation.category === "silent") return null
      return <AdminWorkspaceRedirect />
   }

   if (company) {
      if (company.approvalStatus !== "APPROVED") {
         return (
            <Navigate
               replace
               to={
                  company.approvalStatus === "PENDING"
                     ? "/company/registration/pending"
                     : "/company/registration/rejected"
               }
            />
         )
      }
      return (
         <CompanyLayout>
            <RoutePage>
               <CompanyDashboard />
            </RoutePage>
         </CompanyLayout>
      )
   }

   if (user) {
      return (
         <UserLayout>
            <RoutePage>
               <UserDashboard />
            </RoutePage>
         </UserLayout>
      )
   }

   return (
      <Navigate
         replace
         to="/login"
      />
   )
}

export default DashboardRoute
