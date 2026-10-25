import type { NotificationType } from "../common/enums"

export type { NotificationType } from "../common/enums"

export type Notification = {
   id: string
   message: string
   type: NotificationType
   isRead: boolean
   createdAt: string
   jobId: string | null
   applicationId: string | null
   companyRequestId: string | null
   supportTicketId: string | null
   conversationId: string | null
   job?: { slug: string } | null
}
