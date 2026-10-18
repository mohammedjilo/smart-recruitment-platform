import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { usePermissions } from "./usePermissions"
import type { AdminPermission } from "@/types/adminPermissions"

type Props = {
   permission?: AdminPermission
   permissions?: AdminPermission[]
   children: ReactNode
   fallback?: ReactNode
}

export default function PermissionGuard({
   permission,
   permissions,
   children,
   fallback
}: Props) {
   const { hasPermission } = usePermissions()
   const isAllowed =
      (permission ? hasPermission(permission) : false) ||
      Boolean(permissions?.some(requiredPermission => hasPermission(requiredPermission)))

   if (!isAllowed) {
      return (
         fallback ?? (
            <Navigate
               to="/admin/forbidden"
               replace
            />
         )
      )
   }

   return children
}
