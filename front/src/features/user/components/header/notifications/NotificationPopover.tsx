import { Popover } from "@mui/material"

import type { Notification } from "@/types/notification"

import NotificationHeader from "./NotificationHeader"
import NotificationList from "./NotificationList"
import NotificationFooter from "./NotificationFooter"

type Props = {
   anchorEl: HTMLElement | null
   open: boolean
   onClose: () => void
   onMarkAsRead: (notificationId: string) => Promise<void>
   onMarkAllAsRead: () => void
   isMarkingAllAsRead: boolean
   notifications: Notification[]
   isLoading: boolean
}

const NotificationPopover = ({
   anchorEl,
   open,
   onClose,
   onMarkAsRead,
   onMarkAllAsRead,
   isMarkingAllAsRead,
   notifications,
   isLoading
}: Props) => {
   return (
      <Popover
         anchorEl={anchorEl}
         anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
         }}
         open={open}
         slotProps={{
            paper: {
               className:
                  "mt-2 w-97.5 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border shadow-[0_15px_50px_rgba(0,0,0,0.12)]"
            }
         }}
         transformOrigin={{
            vertical: "top",
            horizontal: "right"
         }}
         onClose={onClose}>
         <NotificationHeader
            isMarkingAllAsRead={isMarkingAllAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
         />

         <NotificationList
            isLoading={isLoading}
            notifications={notifications}
            onClose={onClose}
            onMarkAsRead={onMarkAsRead}
         />

         {!isLoading && notifications.length > 0 && (
            <NotificationFooter onClick={onClose} />
         )}
      </Popover>
   )
}

export default NotificationPopover
