import { Box, Skeleton, Typography } from "@mui/material"
import type { Notification } from "@/types/notification"
import CompanyNotificationItem from "./CompanyNotificationItem"

type Props = {
   notifications: Notification[]
   isLoading: boolean
   onClose: () => void
   onMarkAsRead: (notificationId: string) => Promise<void>
}

const CompanyNotificationList = ({
   notifications,
   isLoading,
   onClose,
   onMarkAsRead
}: Props) => {
   if (isLoading) {
      return (
         <Box className="space-y-3 px-3 py-4">
            {[0, 1, 2].map(item => (
               <Box
                  key={item}
                  className="flex items-start gap-3">
                  <Skeleton
                     variant="circular"
                     width={30}
                     height={30}
                  />
                  <Box className="flex-1 space-y-1">
                     <Skeleton
                        variant="text"
                        width="72%"
                     />
                     <Skeleton
                        variant="text"
                        width="38%"
                     />
                  </Box>
               </Box>
            ))}
         </Box>
      )
   }

   if (notifications.length === 0) {
      return (
         <Box className="px-3 py-6 text-center">
            <Typography
               variant="body2"
               className="text-content! font-medium!">
               No notifications
            </Typography>

            <Typography
               variant="caption"
               className="text-muted!">
               You&apos;re all caught up.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="max-h-105 overflow-y-auto">
         {notifications.slice(0, 5).map(notification => (
            <CompanyNotificationItem
               key={notification.id}
               notification={notification}
               onClose={onClose}
               onMarkAsRead={onMarkAsRead}
            />
         ))}
      </Box>
   )
}

export default CompanyNotificationList
