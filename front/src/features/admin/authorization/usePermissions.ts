import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import type { AdminPermission } from "@/types/adminPermissions"

export function usePermissions() {
   const permissions = useSelector((state: RootState) => state.auth.permissions)

   const hasPermission = (permission: AdminPermission) => permissions.includes(permission)
   const hasAnyPermission = (required: AdminPermission[]) =>
      required.some(permission => permissions.includes(permission))
   const hasAllPermissions = (required: AdminPermission[]) =>
      required.every(permission => permissions.includes(permission))

   return { permissions, hasPermission, hasAnyPermission, hasAllPermissions }
}
