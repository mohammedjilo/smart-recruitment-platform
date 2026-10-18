export type { Notification, NotificationType } from "./entities/notification"
import type { Notification } from "./entities/notification"

export type GetNotificationsResult = {
   success: true
   data: Notification[]
   meta?: {
      page: number
      pageSize: number
      totalCount: number
   }
}

export type NotificationActionResult = {
   success: true
   message: string
   data?: Notification
}
