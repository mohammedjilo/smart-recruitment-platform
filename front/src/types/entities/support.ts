export type SupportCategory = {
   id: string
   name: string
   audience: "USER" | "COMPANY"
   description: string | null
   active: boolean
   createdAt: string
   updatedAt: string
}

export type SupportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type SupportTicketStatus =
   "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED"

export type SupportAuthor = {
   id: string
   firstName?: string
   lastName?: string
   email?: string
   companyName?: string
   role?: "USER" | "ADMIN"
}

export type SupportMessage = {
   id: string
   content: string
   createdAt: string
   updatedAt: string
   authorUserId: string | null
   authorCompanyId: string | null
   authorUser: SupportAuthor | null
   authorCompany: {
      id: string
      companyName: string
      email: string
   } | null
}

export type SupportTicket = {
   id: string
   subject: string
   description: string
   status: SupportTicketStatus
   priority: SupportPriority
   createdAt: string
   updatedAt: string
   creatorUserId: string | null
   creatorCompanyId: string | null
   assignedAdminId: string | null
   categoryId: string | null
   category: SupportCategory | null
   creatorUser: SupportAuthor | null
   creatorCompany: {
      id: string
      companyName: string
      email: string
   } | null
   assignedAdmin: SupportAuthor | null
   messages: SupportMessage[]
}

export type SupportTicketListItem = Pick<
   SupportTicket,
   "id" | "subject" | "status" | "priority" | "createdAt" | "updatedAt" | "categoryId"
> & {
   category: Pick<SupportCategory, "id" | "name"> | null
}

export type SupportAdminTicket = {
   id: string
   subject: string
   status: SupportTicketStatus
   priority: SupportPriority
   createdAt: string
   updatedAt: string
   creatorUserId: string | null
   creatorCompanyId: string | null
   assignedAdminId: string | null
   categoryId: string | null
   category: Pick<SupportCategory, "id" | "name"> | null
   creatorUser: SupportAuthor | null
   creatorCompany: {
      id: string
      companyName: string
      email: string
   } | null
   assignedAdmin: SupportAuthor | null
}

export type SupportCategoriesApiResponse = {
   success: true
   data: SupportCategory[]
}

export type SupportTicketsApiResponse = {
   success: true
   data: SupportTicketListItem[]
   meta: {
      page: number
      pageSize: number
      totalCount: number
   }
}

export type SupportAdminTicketsApiResponse = {
   success: true
   data: SupportAdminTicket[]
   meta: {
      page: number
      pageSize: number
      totalCount: number
   }
   stats: {
      open: number
      inProgress: number
      waitingForUser: number
      resolved: number
      closed: number
   }
}

export type SupportDashboardApiResponse = {
   success: true
   data: {
      stats: {
         open: number
         inProgress: number
         waitingForUser: number
         resolved: number
         assignedToMe: number
      }
      recent: SupportAdminTicket[]
   }
}

export type SupportTicketApiResponse = {
   success: true
   data: SupportTicket
}

export type CreateSupportTicketPayload = {
   subject: string
   description: string
   categoryId?: string
}

export type CreateSupportTicketApiResponse = {
   success: true
   message: string
   data: SupportTicket
}

export type AddSupportMessagePayload = {
   content: string
}

export type AddSupportMessageApiResponse = {
   success: true
   message: string
   data: SupportMessage
}
