import { useState } from "react"
import { Box, Button, Typography } from "@mui/material"
import PaginationFooter from "@/components/common/PaginationFooter"
import {
   useGetNotificationsQuery,
   useMarkAllNotificationsAsReadMutation,
   useMarkNotificationAsReadMutation
} from "@/services/shared/notificationApiCalls"
import NotificationsList from "@/features/user/components/notifications/NotificationsList"
import NotificationsToolbar from "@/features/user/components/notifications/NotificationsToolbar"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { getAdminNotificationTypes } from "@/features/admin/utils/adminNotificationTypes"
import type { NotificationType } from "@/types/notification"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"

const ITEMS_PER_PAGE = 10

const NotificationsPage = () => {
   const [page, setPage] = useState(1)
   const [filter, setFilter] = useState<"ALL" | NotificationType>("ALL")
   const { permissions } = usePermissions()
   const [markNotificationAsRead, markResult] = useMarkNotificationAsReadMutation()
   const markState = getMutationState(markResult)
   const markPresentation = getMutationPresentation(markState, {
      surface: "action",
      importance: "routine"
   })
   const [markAllNotificationsAsRead, markAllResult] =
      useMarkAllNotificationsAsReadMutation()
   const markAllState = getMutationState(markAllResult)
   const markAllPresentation = getMutationPresentation(markAllState, {
      surface: "action",
      importance: "routine"
   })
   const isMarkingAllAsRead = markAllPresentation.category === "loading"
   const allowedTypes = getAdminNotificationTypes(permissions)
   const notificationDescription =
      allowedTypes.includes("SUPPORT") && allowedTypes.includes("COMPANY_REQUEST")
         ? "Support and company request notifications for the current administrator."
         : allowedTypes.includes("SUPPORT")
           ? "Support notifications for the current administrator."
           : allowedTypes.includes("COMPANY_REQUEST")
             ? "Company request notifications for the current administrator."
             : "Notifications available to your current role."
   const { data, isLoading, isFetching } = useGetNotificationsQuery({
      page,
      type: filter === "ALL" ? undefined : filter
   })
   const notifications = (data?.data ?? []).filter(
      notification =>
         allowedTypes.includes(notification.type) &&
         (filter === "ALL" || notification.type === filter)
   )
   const totalCount = notifications.length

   const handleFilterChange = (value: "ALL" | NotificationType) => {
      setFilter(value)
      setPage(1)
   }

   const handleMarkAsRead = async (notificationId: string) => {
      if (markPresentation.category === "loading") return
      try {
         await markNotificationAsRead(notificationId).unwrap()
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "routine" }
         )
         if (errorPresentation.category !== "silent") {
            await showAlert({
               type: "error",
               title: "Could not update notification",
               text: errorPresentation.message
            })
         }
      }
   }
   const handleMarkAllAsRead = async () => {
      if (isMarkingAllAsRead) return
      try {
         await markAllNotificationsAsRead().unwrap()
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "routine" }
         )
         if (errorPresentation.category !== "silent") {
            await showAlert({
               type: "error",
               title: "Could not update notifications",
               text: errorPresentation.message
            })
         }
      }
   }

   return (
      <Box className="min-h-full">
         <Box className="mb-6">
            <Typography className="text-2xl! font-bold! text-[#0F2342]">
               Notifications
            </Typography>
            <Typography className="mt-1! text-sm! text-muted">
               {notificationDescription}
            </Typography>
            <Button
               size="small"
               onClick={() => void handleMarkAllAsRead()}
               disabled={isMarkingAllAsRead}
               className="app-button-secondary mt-3! normal-case!">
               {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
            </Button>
         </Box>

         {isLoading ? (
            <FiltersBarSkeleton pillCount={6} />
         ) : (
            <NotificationsToolbar
               filter={filter}
               allowedTypes={allowedTypes}
               onFilterChange={handleFilterChange}
            />
         )}

         <Box className="mt-6">
            <NotificationsList
               notifications={notifications}
               isLoading={isLoading}
               isFetching={isFetching}
               portal="admin"
               onMarkAsRead={handleMarkAsRead}
            />
         </Box>

         {!isLoading && totalCount > 0 && (
            <PaginationFooter
               page={page}
               pageSize={ITEMS_PER_PAGE}
               totalCount={totalCount}
               setPage={setPage}
               itemLabel="notifications"
               isFetching={isFetching}
            />
         )}
      </Box>
   )
}

export default NotificationsPage
