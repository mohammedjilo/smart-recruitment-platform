import type { ReactNode } from "react"
import { Navigate, useOutletContext } from "react-router-dom"
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
   const serverPermissions = useOutletContext<AdminPermission[]>()

   const isAllowed =
      (permission ? serverPermissions.includes(permission) : false) ||
      Boolean(permissions?.some(requiredPermission => serverPermissions.includes(requiredPermission)))

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
