import { Box, IconButton, Typography } from "@mui/material"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { formatDate } from "@/utils/formatDate"

import { useLocation, useNavigate } from "react-router-dom"
import type { Notification, NotificationType } from "@/types/notification"
import {
   notificationColors,
   notificationIcons
} from "@/features/user/utils/notificationItem.utils"

type Props = {
   notification: Notification
   onClose: () => void
   onMarkAsRead: (notificationId: string) => Promise<void>
}

const NotificationItem = ({ notification, onClose, onMarkAsRead }: Props) => {
   const navigate = useNavigate()
   const location = useLocation()

   const colors = notificationColors[notification.type]

   const handleClick = async () => {
      onClose()
      await onMarkAsRead(notification.id)

      if (notification.supportTicketId) {
         navigate(
            location.pathname.startsWith("/admin")
               ? `/admin/support/${notification.supportTicketId}`
               : `/user/support/requests/${notification.supportTicketId}`
         )
         return
      }

      if (
         notification.type === "COMPANY_REQUEST" &&
         location.pathname.startsWith("/admin")
      ) {
         navigate("/admin/company-requests")
         return
      }

      if (notification.conversationId) {
         navigate(`/messages/${notification.conversationId}`)
         return
      }

      if (notification.applicationId) {
         navigate(`/applications`)
         return
      }

      if (notification.jobId) {
         navigate(
            notification.job?.slug
               ? `/jobs/${notification.jobId}/${notification.job.slug}`
               : "/jobs"
         )
         return
      }

      navigate("/notifications")
   }

   return (
      <Box
         component="button"
         onClick={handleClick}
         className={`relative flex w-full cursor-pointer gap-3 border-0 border-b border-border px-5 py-3.5 text-left transition-colors duration-200 hover:bg-bg ${notification.isRead ? "bg-surface" : "bg-[rgba(37,99,235,0.035)]"}`}>
         {/* Unread dot */}
         {!notification.isRead && (
            <Box className="absolute top-7 left-2 h-1.75 w-1.75 rounded-full bg-blue-600" />
         )}

         {/* Icon */}
         <Box
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full [&>svg]:text-[21px] ${colors}`}>
            {notificationIcons[notification.type]}
         </Box>

         {/* Content */}
         <Box className="min-w-0 flex-1">
            <Typography
               variant="body2"
               className="leading-[1.4]! text-content!">
               {getNotificationTitle(notification.type)}
            </Typography>

            <Typography
               variant="caption"
               className="mt-0.5! line-clamp-2! leading-normal!" color="textSecondary">
               {notification.message}
            </Typography>

            <Typography
               variant="caption"
               className="mt-0.5! block text-[11px]!" color="textSecondary">
               {formatNotificationDate(notification.createdAt)}
            </Typography>
         </Box>

         {/* Arrow */}
         <IconButton
            size="small"
            className="self-center text-muted!">
            <ChevronRightIcon fontSize="small" />
         </IconButton>
      </Box>
   )
}

const getNotificationTitle = (type: NotificationType) => {
   switch (type) {
      case "APPLICATION":
         return "Application update"

      case "MESSAGE":
         return "New message"

      case "INTERVIEW":
         return "Interview notification"

      case "JOB":
         return "Job notification"

      case "SYSTEM":
         return "System notification"

      case "SUPPORT":
         return "Support notification"

      case "COMPANY_REQUEST":
         return "Company request notification"

      default:
         return "Notification"
   }
}

const formatNotificationDate = (date: string) => {
   const createdAt = new Date(date)
   const now = new Date()

   const diff = Math.floor((now.getTime() - createdAt.getTime()) / 1000)

   if (diff < 60) {
      return "Just now"
   }

   const minutes = Math.floor(diff / 60)

   if (minutes < 60) {
      return `${minutes} min ago`
   }

   const hours = Math.floor(minutes / 60)

   if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
   }

   const days = Math.floor(hours / 24)

   if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""} ago`
   }

   return formatDate(createdAt)
}

export default NotificationItem
