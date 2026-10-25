import { Box, IconButton, Typography } from "@mui/material"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { formatDate } from "@/utils/formatDate"

import { useNavigate } from "react-router-dom"

import type { Notification } from "@/types/notification"
import { companyNotificationConfig } from "@/features/company/utils/companyNotificationItem.utils"

type Props = {
   notification: Notification
   onMarkAsRead: (notificationId: string) => Promise<void>
}

const NotificationListItem = ({ notification, onMarkAsRead }: Props) => {
   const navigate = useNavigate()

   const config = companyNotificationConfig[notification.type]

   const handleClick = async () => {
      if (!notification.isRead) await onMarkAsRead(notification.id)

      if (notification.supportTicketId) {
         navigate(`/company/support/requests/${notification.supportTicketId}`)

         return
      }

      if (notification.conversationId) {
         navigate(`/company/messages/${notification.conversationId}`)

         return
      }

      if (notification.applicationId) {
         navigate("/company/applications")

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

      navigate("/company/notifications")
   }

   return (
      <Box
         className={[
            "relative flex min-h-26.5 w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-[#F8FAFD] sm:px-2.5",
            notification.isRead ? "bg-surface" : "bg-[#FCFDFF]"
         ].join(" ")}
         type="button"
         component="button"
         onClick={handleClick}>
         {/* Unread dot */}
         {!notification.isRead && (
            <Box className="absolute top-1/2 left-2.5 h-1.75 w-1.75 -translate-y-1/2 rounded-full bg-[#2167E8]" />
         )}

         {/* Icon */}
         <Box
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: config.background, color: config.color }}>
            {config.icon}
         </Box>

         {/* Content */}
         <Box className="min-w-0 flex-1">
            <Typography
               className={[
                  "overflow-hidden! text-[12.5px]! leading-[1.4]! text-ellipsis! whitespace-nowrap! text-[#142A49]",
                  notification.isRead ? "font-medium!" : "font-bold!"
               ].join(" ")}>
               {config.title}
            </Typography>

            <Typography className="mt-1! overflow-hidden! text-[11.5px]! leading-5! text-ellipsis! whitespace-nowrap! text-[#7890AF]">
               {notification.message}
            </Typography>

            {/* Type */}
            <Box
               className="mt-2 inline-flex items-center rounded-md px-2 py-0.5"
               style={{ backgroundColor: config.background, color: config.color }}>
               <Typography className="text-[9.5px]! leading-[1.3]! font-medium!">
                  {getTypeLabel(notification.type)}
               </Typography>
            </Box>
         </Box>

         {/* Time */}
         <Typography className="w-16.25! shrink-0! self-center! text-right! text-[10.5px]! text-[#7890AF] sm:w-22.5">
            {formatNotificationDate(notification.createdAt)}
         </Typography>

         {/* Arrow */}
         <IconButton
            className="shrink-0! p-1! text-[#8FA1B8]"
            size="small"
            tabIndex={-1}>
            <ChevronRightIcon className="text-[18px]" />
         </IconButton>
      </Box>
   )
}

const getTypeLabel = (type: Notification["type"]) => {
   switch (type) {
      case "APPLICATION":
         return "Application"

      case "MESSAGE":
         return "Message"

      case "INTERVIEW":
         return "Interview"

      case "JOB":
         return "Job"

      case "SYSTEM":
         return "System"

      case "SUPPORT":
         return "Support"

      default:
         return "Notification"
   }
}

const formatNotificationDate = (date: string) => {
   const createdAt = new Date(date)

   const now = new Date()

   const diff = now.getTime() - createdAt.getTime()

   const seconds = Math.floor(diff / 1000)

   if (seconds < 60) {
      return "Just now"
   }

   const minutes = Math.floor(seconds / 60)

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

export default NotificationListItem
