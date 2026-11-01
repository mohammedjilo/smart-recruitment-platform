import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import type { AdminPermission } from "@/types/adminPermissions"
import { hasAdminPermission } from "./demoAdmin"

export function usePermissions() {
   const permissions = useSelector((state: RootState) => state.auth.permissions)

   const hasPermission = (permission: AdminPermission) =>
      hasAdminPermission(permissions, permission)
   const hasAnyPermission = (required: AdminPermission[]) =>
      required.some(permission => hasAdminPermission(permissions, permission))
   const hasAllPermissions = (required: AdminPermission[]) =>
      required.every(permission => hasAdminPermission(permissions, permission))

   return { permissions, hasPermission, hasAnyPermission, hasAllPermissions }
}
