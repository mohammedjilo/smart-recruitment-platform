import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useGetCurrentAdminPermissionsQuery } from "@/features/admin/services/adminApiCalls"
import { Box, Button, Typography } from "@mui/material"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

export default function AdminGuard() {
   const user = useSelector((state: RootState) => state.auth.user)
   const company = useSelector((state: RootState) => state.auth.company)
   const location = useLocation()
   const isAdmin = user?.role === "ADMIN"
   const permissionsQuery = useGetCurrentAdminPermissionsQuery(user?.id ?? "", {
      skip: !isAdmin || !user?.id
   })
   const permissionsState = getQueryState(permissionsQuery)
   const permissionsPresentation = getQueryPresentation(permissionsState, "page")
   if (!isAdmin) {
      if (user) {
         return (
            <Navigate
               to="/dashboard"
               replace
            />
         )
      }
      if (company) {
         return (
            <Navigate
               to="/dashboard"
               replace
            />
         )
      }
      return (
         <Navigate
            to="/login"
            replace
            state={{ from: location }}
         />
      )
   }

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
            <Typography className="text-sm! text-red-600!" role="alert" aria-live="assertive">
               {permissionsPresentation.category === "page_error" &&
               permissionsState.status === "inconsistent"
                  ? "Admin permissions could not be verified."
                  : permissionsPresentation.message}
            </Typography>
            <Button
               onClick={() => void permissionsQuery.refetch()}
               className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }
   if (permissionsPresentation.category === "silent") return null

   return <Outlet />
}
