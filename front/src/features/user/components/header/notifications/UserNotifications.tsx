import { useState } from "react"
import { useLocation } from "react-router-dom"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { getAdminNotificationTypes } from "@/features/admin/utils/adminNotificationTypes"
import NotificationButton from "./NotificationButton"
import NotificationPopover from "./NotificationPopover"
import {
   useGetNotificationsQuery,
   useMarkAllNotificationsAsReadMutation,
   useMarkNotificationAsReadMutation
} from "@/services/shared/notificationApiCalls"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"

const UserNotifications = () => {
   const location = useLocation()
   const { permissions } = usePermissions()
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

   const { data, isLoading } = useGetNotificationsQuery()
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

   const notifications = location.pathname.startsWith("/admin")
      ? (data?.data ?? []).filter(notification =>
           getAdminNotificationTypes(permissions).includes(notification.type)
        )
      : (data?.data ?? [])

   const unreadCount = notifications.filter(notification => !notification.isRead).length

   const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
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

   const open = Boolean(anchorEl)

   return (
      <>
         <NotificationButton
            unreadCount={unreadCount}
            onClick={handleOpen}
         />

         <NotificationPopover
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            isMarkingAllAsRead={isMarkingAllAsRead}
            notifications={notifications}
            isLoading={isLoading}
         />
      </>
   )
}

export default UserNotifications
