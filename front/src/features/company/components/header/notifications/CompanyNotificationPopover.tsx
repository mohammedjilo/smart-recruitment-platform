import { Popover } from "@mui/material"
import type { Notification } from "@/types/notification"
import CompanyNotificationHeader from "./CompanyNotificationHeader"
import CompanyNotificationList from "./CompanyNotificationList"
import CompanyNotificationFooter from "./CompanyNotificationFooter"

type Props = {
   anchorEl: HTMLElement | null
   open: boolean
   onClose: () => void
   onMarkAsRead: (notificationId: string) => Promise<void>
   onMarkAllAsRead: () => Promise<void>
   isMarkingAllAsRead: boolean
   notifications: Notification[]
   isLoading: boolean
}

const CompanyNotificationPopover = ({
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
                  "mt-2 w-[calc(100vw-24px)] max-w-97.5 overflow-hidden rounded-lg border border-border shadow-[0_12px_40px_rgba(0,0,0,0.10)] sm:w-97.5"
            }
         }}
         transformOrigin={{
            vertical: "top",
            horizontal: "right"
         }}
         onClose={onClose}>
         <CompanyNotificationHeader
            isMarkingAllAsRead={isMarkingAllAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
         />

         <CompanyNotificationList
            isLoading={isLoading}
            notifications={notifications}
            onClose={onClose}
            onMarkAsRead={onMarkAsRead}
         />

         {!isLoading && notifications.length > 0 && (
            <CompanyNotificationFooter onClose={onClose} />
         )}
      </Popover>
   )
}

export default CompanyNotificationPopover
