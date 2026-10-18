import { smartApi } from "@/services/api/baseApi"

export type MessageSenderUser = {
   id: string
   firstName?: string | null
   lastName?: string | null
   email?: string | null
   profilePicUrl?: string | null
}

export type MessageSenderCompany = {
   id: string
   companyName?: string | null
   email?: string | null
   logoUrl?: string | null
}

export type MessageItem = {
   id: string
   content: string
   isRead: boolean
   readByUser: boolean
   readByCompany: boolean
   createdAt: string
   updatedAt: string
   conversationId: string | null
   senderUserId: string | null
   senderCompanyId: string | null
   senderUser?: MessageSenderUser | null
   senderCompany?: MessageSenderCompany | null
}

export type ConversationItem = {
   id: string
   userId: string
   companyId: string
   applicationId: string
   createdAt: string
   updatedAt: string
   user?: {
      id: string
      firstName?: string | null
      lastName?: string | null
      profilePicUrl?: string | null
   }
   company?: {
      id: string
      companyName?: string | null
      logoUrl?: string | null
   }
   application?: {
      id: string
      job?: { id: string; title?: string | null }
   }
   messages?: MessageItem[]
   lastMessage?: MessageItem | null
   unreadCount?: number
}

export type PaginatedPayload<T> = {
   success: true
   data: T[]
   meta: {
      page: number
      pageSize: number
      totalCount: number
   }
}

export type ConversationListResult = PaginatedPayload<ConversationItem>
export type ConversationMessagesResult = {
   success: true
   data: {
      messages: MessageItem[]
      hasMore: boolean
   }
}

export type ConversationMessagesArgs = {
   conversationId: string
   before?: string
}

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getUserConversations: builder.query<ConversationListResult, void>({
         query: () => "/api/message",
         providesTags: result => [
            { type: "Conversations", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Conversations" as const, id })) ??
               [])
         ]
      }),
      getCompanyConversations: builder.query<ConversationListResult, void>({
         query: () => "/api/message/company",
         providesTags: result => [
            { type: "Conversations", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Conversations" as const, id })) ??
               [])
         ]
      }),
      getConversationMessages: builder.query<
         ConversationMessagesResult,
         ConversationMessagesArgs
      >({
         query: ({ conversationId, before }) => ({
            url: `/api/message/conversation/${conversationId}`,
            params: before ? { before } : undefined
         }),
         providesTags: (_result, _error, { conversationId }) => [
            { type: "Messages", id: conversationId }
         ]
      }),
      sendApplicationMessage: builder.mutation<
         { success: true; message: string; data: MessageItem },
         { applicationId: string; userId?: string; content: string }
      >({
         query: ({ applicationId, content }) => ({
            url: `/api/message/application/${applicationId}`,
            method: "POST",
            body: { content }
         }),
         invalidatesTags: result => {
            const conversationId = result?.data.conversationId
            return [
               { type: "Conversations", id: "PARTIAL-LIST" },
               ...(conversationId
                  ? [{ type: "Conversations" as const, id: conversationId }]
                  : []),
               ...(conversationId
                  ? [{ type: "Messages" as const, id: conversationId }]
                  : [])
            ]
         }
      }),
      markConversationAsRead: builder.mutation<
         { success: true; message: string },
         string
      >({
         query: conversationId => ({
            url: `/api/message/conversation/${conversationId}/read`,
            method: "PATCH"
         }),
         invalidatesTags: (_result, _error, conversationId) => [
            { type: "Conversations", id: conversationId },
            { type: "Messages", id: conversationId }
         ]
      })
   })
})

export const {
   useGetUserConversationsQuery,
   useGetCompanyConversationsQuery,
   useGetConversationMessagesQuery,
   useLazyGetConversationMessagesQuery,
   useSendApplicationMessageMutation,
   useMarkConversationAsReadMutation
} = extendedSmartApi

export { extendedSmartApi as smartApi }
