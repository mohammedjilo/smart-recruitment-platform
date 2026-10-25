import { Box, IconButton, Typography } from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useNavigate } from "react-router-dom"

import type { Notification } from "@/types/notification"
import { formatDate } from "@/utils/formatDate"
import {
   notificationColors,
   notificationIcons
} from "@/features/user/utils/notificationItem.utils"
import { getAdminCompanyDetailsPath } from "@/utils/companyRoutes"

type Props = {
   notification: Notification
   portal?: "user" | "admin"
   onMarkAsRead?: (notificationId: string) => Promise<void>
}

const NotificationListItem = ({ notification, portal = "user", onMarkAsRead }: Props) => {
   const navigate = useNavigate()
   const colors = notificationColors[notification.type]

   const handleClick = async () => {
      if (!notification.isRead && onMarkAsRead) {
         await onMarkAsRead(notification.id)
      }

      if (notification.supportTicketId) {
         navigate(
            portal === "admin"
               ? `/admin/support/${notification.supportTicketId}`
               : `/user/support/requests/${notification.supportTicketId}`
         )
         return
      }

      if (notification.type === "COMPANY_REQUEST" && portal === "admin") {
         navigate(
            notification.companyRequestId
               ? getAdminCompanyDetailsPath(notification.companyRequestId)
               : "/admin/company-requests"
         )
         return
      }

      if (notification.applicationId) {
         navigate(portal === "admin" ? "/admin/applications" : "/applications")
         return
      }

      if (notification.jobId) {
         navigate(
            portal === "admin"
               ? "/admin/jobs"
               : notification.job?.slug
                 ? `/jobs/${notification.jobId}/${notification.job.slug}`
                 : "/jobs"
         )
         return
      }

      navigate(portal === "admin" ? "/admin/notifications" : "/notifications")
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
         {!notification.isRead && (
            <Box className="absolute top-1/2 left-2.5 h-1.75 w-1.75 -translate-y-1/2 rounded-full bg-[#2167E8]" />
         )}

         <Box
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full [&>svg]:text-[21px] ${colors}`}>
            {notificationIcons[notification.type]}
         </Box>

         <Box className="min-w-0 flex-1">
            <Typography
               className={[
                  "overflow-hidden! text-[12.5px]! leading-[1.4]! text-ellipsis! whitespace-nowrap! text-[#142A49]",
                  notification.isRead ? "font-medium!" : "font-bold!"
               ].join(" ")}>
               {getNotificationTitle(notification.type)}
            </Typography>

            <Typography className="mt-1! overflow-hidden! text-[11.5px]! leading-5! text-ellipsis! whitespace-nowrap! text-[#7890AF]">
               {notification.message}
            </Typography>

            <Box
               className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 ${colors}`}>
               <Typography className="text-[9.5px]! leading-[1.3]! font-medium!">
                  {getTypeLabel(notification.type)}
               </Typography>
            </Box>
         </Box>

         <Typography className="w-16.25! shrink-0! self-center! text-right! text-[10.5px]! text-[#7890AF] sm:w-22.5">
            {formatNotificationDate(notification.createdAt)}
         </Typography>

         <IconButton
            className="shrink-0! p-1! text-[#8FA1B8]"
            size="small"
            tabIndex={-1}>
            <ChevronRightIcon className="text-[18px]" />
         </IconButton>
      </Box>
   )
}

const getNotificationTitle = (type: Notification["type"]) => {
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

      case "COMPANY_REQUEST":
         return "Company requests"

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
