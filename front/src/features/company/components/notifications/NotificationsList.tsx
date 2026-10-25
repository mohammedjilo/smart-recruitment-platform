import { Box, Typography } from "@mui/material"

import type { Notification } from "@/types/notification"
import NotificationListItem from "./NotificationListItem"
import NotificationListSkeleton from "@/components/common/NotificationListSkeleton"

type Props = {
   notifications: Notification[]
   isLoading: boolean
   isFetching: boolean
   onMarkAsRead: (notificationId: string) => Promise<void>
}

const NotificationsList = ({
   notifications,
   isLoading,
   isFetching,
   onMarkAsRead
}: Props) => {
   if (isLoading) {
      return <NotificationListSkeleton />
   }

   if (notifications.length === 0) {
      return (
         <Box className="bg-surface flex min-h-100 flex-col items-center justify-center rounded-xl border border-[#E2EAF4]">
            <Typography className="text-[15px] font-semibold text-[#263B58]">
               No notifications
            </Typography>

            <Typography className="mt-1 text-[12px] text-[#8293AA]">
               You&apos;re all caught up.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="bg-surface relative overflow-hidden rounded-xl border border-[#E2EAF4]">
         {isFetching && (
            <Box className="absolute inset-x-0 top-0 z-10 h-0.5 bg-[#2167E8]" />
         )}

         {notifications.map(notification => (
            <NotificationListItem
               key={notification.id}
               notification={notification}
               onMarkAsRead={onMarkAsRead}
            />
         ))}
      </Box>
   )
}

export default NotificationsList
