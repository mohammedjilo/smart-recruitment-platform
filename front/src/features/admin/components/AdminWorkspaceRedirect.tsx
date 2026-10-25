import { CircularProgress } from "@mui/material"
import { Navigate } from "react-router-dom"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import { useGetCurrentAdminPermissionsQuery } from "@/features/admin/services/adminApiCalls"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { getQueryState } from "@/utils/queryState"

export default function AdminWorkspaceRedirect() {
   const adminId = useSelector((state: RootState) =>
      state.auth.user?.role === "ADMIN" ? state.auth.user.id : undefined
   )
   const permissionsQuery = useGetCurrentAdminPermissionsQuery(adminId ?? "", {
      skip: !adminId
   })
   const permissionsState = getQueryState(permissionsQuery)

   if (
      permissionsState.status === "initial_loading" ||
      permissionsState.status === "refreshing" ||
      permissionsState.status === "idle"
   ) {
      return <CircularProgress />
   }

   const permissions =
      "data" in permissionsState
         ? permissionsState.data?.data.permissions ?? []
         : []

   if (permissions.includes(ADMIN_PERMISSIONS.VIEW_ADMIN_DASHBOARD)) {
      return (
         <Navigate
            replace
            to="/admin/dashboard"
         />
      )
   }

   if (permissions.includes(ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD)) {
      return (
         <Navigate
            replace
            to="/admin/support"
         />
      )
   }

   if (permissions.includes(ADMIN_PERMISSIONS.VIEW_OPERATIONS_DASHBOARD)) {
      return (
         <Navigate
            replace
            to="/admin/operations"
         />
      )
   }

   return <Navigate replace to="/admin/forbidden" />
}
