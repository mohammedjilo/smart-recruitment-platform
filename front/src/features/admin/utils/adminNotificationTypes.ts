import { ADMIN_PERMISSIONS, type AdminPermission } from "@/types/adminPermissions"
import type { NotificationType } from "@/types/notification"

const supportPermissions: AdminPermission[] = [
   ADMIN_PERMISSIONS.VIEW_SUPPORT,
   ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
   ADMIN_PERMISSIONS.VIEW_SUPPORT_TICKETS
]

export const getAdminNotificationTypes = (
   permissions: AdminPermission[]
): NotificationType[] => {
   const types: NotificationType[] = []

   if (supportPermissions.some(permission => permissions.includes(permission))) {
      types.push("SUPPORT")
   }

   if (permissions.includes(ADMIN_PERMISSIONS.VIEW_COMPANIES)) {
      types.push("COMPANY_REQUEST")
   }

   return types
}
