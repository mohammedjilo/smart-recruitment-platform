import { Box, Typography } from "@mui/material"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { formatDate } from "@/utils/formatDate"

import { useNavigate } from "react-router-dom"
import type { Notification } from "@/types/notification"
import { companyNotificationConfig } from "@/features/company/utils/companyNotificationItem.utils"

type Props = {
   notification: Notification
   onClose: () => void
   onMarkAsRead: (notificationId: string) => Promise<void>
}

const CompanyNotificationItem = ({ notification, onClose, onMarkAsRead }: Props) => {
   const navigate = useNavigate()

   const config = companyNotificationConfig[notification.type]

   const handleClick = async () => {
      onClose()
      await onMarkAsRead(notification.id)

      if (notification.supportTicketId) {
         navigate(`/company/support/requests/${notification.supportTicketId}`)

         return
      }

      if (notification.conversationId) {
         navigate(`/company/messages/${notification.conversationId}`)

         return
      }

      if (notification.applicationId) {
         navigate(`/company/applications`)

         return
      }

      if (notification.jobId) {
         navigate(
            notification.job?.slug
               ? `/company/jobs/${notification.jobId}/${notification.job.slug}`
               : "/company/jobs"
         )

         return
      }

      navigate(`/company/notifications`)
   }

   return (
      <Box
         component="button"
         onClick={handleClick}
         className={`relative flex w-full cursor-pointer gap-3 border-0 border-b border-border px-5 py-3 text-left transition-colors duration-200 hover:bg-slate-100 ${notification.isRead ? "bg-surface" : "bg-[rgba(37,99,235,0.025)]"}`}>
         {/* Unread indicator */}
         {!notification.isRead && (
            <Box className="absolute top-6 left-2.5 h-1.75 w-1.75 rounded-full bg-blue-600" />
         )}

         {/* Notification icon */}
         <Box
            className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full [&>svg]:text-[20px]"
            style={{ backgroundColor: config.background, color: config.color }}>
            {config.icon}
         </Box>

         {/* Content */}
         <Box className="min-w-0 flex-1">
            <Typography
               variant="body2"
               className={`text-[13px]! leading-[1.4]! text-content! ${notification.isRead ? "font-medium!" : "font-semibold!"}`}>
               {config.title}
            </Typography>

            <Typography
               variant="body2"
               className="mt-0.5! line-clamp-2! overflow-hidden text-[12px]! leading-normal! text-muted!">
               {notification.message}
            </Typography>

            <Typography
               variant="caption"
               className="mt-0.5! block text-[10.5px]! text-muted!">
               {formatNotificationDate(notification.createdAt)}
            </Typography>
         </Box>

         {/* Arrow */}
         <ChevronRightIcon className="mt-2.5! text-[17px]! text-muted!" />
      </Box>
   )
}

const formatNotificationDate = (date: string) => {
   const createdAt = new Date(date)
   const now = new Date()

   const difference = now.getTime() - createdAt.getTime()

   const seconds = Math.floor(difference / 1000)

   if (seconds < 60) {
      return "Just now"
   }

   const minutes = Math.floor(seconds / 60)

   if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
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

export default CompanyNotificationItem
