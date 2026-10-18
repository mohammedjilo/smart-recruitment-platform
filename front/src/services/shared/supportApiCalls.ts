import { smartApi } from "@/services/api/baseApi"
import type {
   AddSupportMessageApiResponse,
   CreateSupportTicketApiResponse,
   CreateSupportTicketPayload,
   SupportCategoriesApiResponse,
   SupportAdminTicketsApiResponse,
   SupportDashboardApiResponse,
   SupportTicketApiResponse,
   SupportTicketsApiResponse
} from "@/types/entities/support"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getSupportCategories: builder.query<
         SupportCategoriesApiResponse,
         "USER" | "COMPANY" | void
      >({
         query: audience => ({
            url: "/api/support/categories",
            params: audience ? { audience } : undefined
         }),
         providesTags: ["SupportCategories"]
      }),
      getMySupportTickets: builder.query<
         SupportTicketsApiResponse,
         { page?: number; pageSize?: number } | void
      >({
         query: (args = {}) => {
            const { page = 1, pageSize = 20 } = args as {
               page?: number
               pageSize?: number
            }

            return {
               url: "/api/support/tickets",
               params: {
                  page,
                  pageSize
               }
            }
         },
         providesTags: result => [
            { type: "SupportTickets", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "SupportTickets" as const, id })) ??
               [])
         ]
      }),
      getAdminSupportTickets: builder.query<
         SupportAdminTicketsApiResponse,
         {
            page?: number
            pageSize?: number
            search?: string
            status?: string
            priority?: string
            categoryId?: string
            audience?: "USER" | "COMPANY"
            assignedAdminId?: string
         } | void
      >({
         query: ({
            page = 1,
            pageSize = 20,
            search,
            status,
            priority,
            categoryId,
            audience,
            assignedAdminId
         } = {}) => ({
            url: "/api/support/admin/tickets",
            params: {
               page,
               pageSize,
               search: search || undefined,
               status: status || undefined,
               priority: priority || undefined,
               categoryId: categoryId || undefined,
               audience: audience || undefined,
               assignedAdminId: assignedAdminId || undefined
            }
         }),
         providesTags: result => [
            { type: "SupportTickets", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "SupportTickets" as const, id })) ??
               [])
         ]
      }),
      getSupportDashboard: builder.query<SupportDashboardApiResponse, void>({
         query: () => "/api/support/admin/dashboard",
         providesTags: ["SupportDashboard"]
      }),
      assignSupportTicket: builder.mutation<
         SupportTicketApiResponse,
         { ticketId: string; assignedAdminId: string; actorAdminId?: string }
      >({
         query: ({ ticketId, assignedAdminId }) => ({
            url: `/api/support/admin/tickets/${ticketId}/assign`,
            method: "PATCH",
            body: { assignedAdminId }
         }),
         invalidatesTags: (
            _result,
            _error,
            { ticketId, assignedAdminId, actorAdminId }
         ) => [
            { type: "SupportTickets", id: ticketId },
            ...(actorAdminId && assignedAdminId === actorAdminId
               ? ([{ type: "Notifications", id: "PARTIAL-LIST" }] as const)
               : [])
         ]
      }),
      unassignSupportTicket: builder.mutation<SupportTicketApiResponse, string>({
         query: ticketId => ({
            url: `/api/support/admin/tickets/${ticketId}/unassign`,
            method: "PATCH"
         }),
         invalidatesTags: (_result, _error, ticketId) => [
            { type: "SupportTickets", id: ticketId }
         ]
      }),
      updateSupportTicketStatus: builder.mutation<
         SupportTicketApiResponse,
         { ticketId: string; status: string; actorAdminId?: string }
      >({
         query: ({ ticketId, status }) => ({
            url: `/api/support/admin/tickets/${ticketId}/status`,
            method: "PATCH",
            body: { status }
         }),
         invalidatesTags: (result, _error, { ticketId, actorAdminId }) => [
            { type: "SupportTickets", id: ticketId },
            ...(actorAdminId && result?.data.assignedAdminId === actorAdminId
               ? ([{ type: "Notifications", id: "PARTIAL-LIST" }] as const)
               : [])
         ]
      }),
      updateSupportTicketPriority: builder.mutation<
         SupportTicketApiResponse,
         { ticketId: string; priority: string }
      >({
         query: ({ ticketId, priority }) => ({
            url: `/api/support/admin/tickets/${ticketId}/priority`,
            method: "PATCH",
            body: { priority }
         }),
         invalidatesTags: (_result, _error, { ticketId }) => [
            { type: "SupportTickets", id: ticketId }
         ]
      }),
      getSupportTicketById: builder.query<SupportTicketApiResponse, string>({
         query: ticketId => `/api/support/tickets/${ticketId}`,
         providesTags: (_result, _error, ticketId) => [
            { type: "SupportTickets", id: ticketId }
         ]
      }),
      createSupportTicket: builder.mutation<
         CreateSupportTicketApiResponse,
         CreateSupportTicketPayload
      >({
         query: body => ({
            url: "/api/support/tickets",
            method: "POST",
            body
         })
      }),
      addSupportMessage: builder.mutation<
         AddSupportMessageApiResponse,
         {
            ticketId: string
            content: string
            requiresUserResponse?: boolean
            recipientUserId?: string | null
            actorAdminId?: string
         }
      >({
         query: ({ ticketId, content, requiresUserResponse }) => ({
            url: `/api/support/tickets/${ticketId}/messages`,
            method: "POST",
            body: { content, requiresUserResponse }
         }),
         invalidatesTags: (
            _result,
            _error,
            { ticketId, recipientUserId, actorAdminId }
         ) => [
            { type: "SupportTickets", id: ticketId },
            ...(actorAdminId && recipientUserId === actorAdminId
               ? ([{ type: "Notifications", id: "PARTIAL-LIST" }] as const)
               : [])
         ]
      })
   })
})

export const {
   useGetSupportCategoriesQuery,
   useGetMySupportTicketsQuery,
   useGetAdminSupportTicketsQuery,
   useGetSupportDashboardQuery,
   useGetSupportTicketByIdQuery,
   useCreateSupportTicketMutation,
   useAddSupportMessageMutation,
   useAssignSupportTicketMutation,
   useUnassignSupportTicketMutation,
   useUpdateSupportTicketStatusMutation,
   useUpdateSupportTicketPriorityMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
