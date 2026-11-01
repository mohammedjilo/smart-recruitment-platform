import type { ReactNode } from "react"
import { Navigate, useOutletContext } from "react-router-dom"
import type { AdminPermission } from "@/types/adminPermissions"
import { hasAdminPermission } from "./demoAdmin"

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
   const serverPermissions = useOutletContext<AdminPermission[]>()

   const isAllowed =
      (permission ? hasAdminPermission(serverPermissions, permission) : false) ||
      Boolean(
         permissions?.some(requiredPermission =>
            hasAdminPermission(serverPermissions, requiredPermission)
         )
      )

   if (!isAllowed) {
      return (
         fallback ?? (
            <Navigate
               replace
               to="/admin/forbidden"
            />
         )
      )
   }

   return children
}
