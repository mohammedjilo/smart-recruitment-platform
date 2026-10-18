import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
   AddSupportMessageApiResponse,
   CreateSupportTicketApiResponse,
   CreateSupportTicketPayload,
   SupportCategoriesApiResponse,
   SupportTicketApiResponse,
   SupportTicketsApiResponse
} from "@/types/entities/support"
import { normalizeApiError } from "@/utils/apiError"

const apiBaseUrl =
   import.meta.env.VITE_API_BASE_URL ??
   (import.meta.env.DEV || import.meta.env.MODE === "test"
      ? "http://localhost:3000"
      : undefined)

if (!apiBaseUrl) {
   throw new Error("VITE_API_BASE_URL is required outside development and tests.")
}

type SupportOnlySessionResponse = {
   success: true
   data: { mode: "support_only"; accountType: "user" | "company" }
}

type SupportAccessResult = {
   success: true
   data: { mode: "support_only" | "active" }
}

type SupportOnlyActionResponse = {
   success: true
   message?: string
}

export class SupportOnlyAccessError extends Error {
   constructor(message: string) {
      super(message)
      this.name = "SupportOnlyAccessError"
   }
}

const genericSupportAccessMessage = "Credentials could not be verified."

const isSupportAccessResult = (value: unknown): value is SupportAccessResult =>
   typeof value === "object" &&
   value !== null &&
   "success" in value &&
   value.success === true &&
   "data" in value &&
   typeof value.data === "object" &&
   value.data !== null &&
   "mode" in value.data &&
   (value.data.mode === "active" || value.data.mode === "support_only")

const supportAccessErrorMessage = (status: number) => {
   if (status === 401) return "Invalid email or password."
   if (status === 403) return "Support-only access is not available for this account."
   if (status === 400 || status === 422) return "Enter valid account credentials."
   if (status === 429) return "Too many attempts. Please try again later."
   return normalizeApiError({ status }).message
}

export const verifySupportOnlyCredentials = async (credentials: {
   role: "user" | "company"
   email: string
   password: string
}) => {
   let response: Response
   try {
      response = await fetch(`${apiBaseUrl}/api/auth/support-access`, {
         method: "POST",
         credentials: "include",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(credentials)
      })
   } catch (error) {
      const normalizedError = normalizeApiError({
         status: "FETCH_ERROR",
         error: error instanceof Error ? error.message : ""
      })
      throw new SupportOnlyAccessError(normalizedError.message)
   }

   if (!response.ok) {
      throw new SupportOnlyAccessError(supportAccessErrorMessage(response.status))
   }

   let result: unknown
   try {
      result = await response.json()
   } catch {
      throw new SupportOnlyAccessError(genericSupportAccessMessage)
   }

   if (!isSupportAccessResult(result)) {
      throw new SupportOnlyAccessError(genericSupportAccessMessage)
   }

   return result
}

export const supportOnlyApi = createApi({
   reducerPath: "supportOnlyApi",
   baseQuery: fetchBaseQuery({
      baseUrl: apiBaseUrl,
      credentials: "include",
      timeout: 30_000
   }),
   tagTypes: ["SupportOnlyTickets", "SupportOnlyCategories"],
   endpoints: builder => ({
      endSupportAccess: builder.mutation<SupportOnlyActionResponse, void>({
         query: () => ({
            url: "/api/auth/support-access/logout",
            method: "POST"
         })
      }),
      getSupportOnlySession: builder.query<SupportOnlySessionResponse, void>({
         query: () => "/api/support-only/session"
      }),
      getSupportOnlyCategories: builder.query<SupportCategoriesApiResponse, void>({
         query: () => "/api/support-only/categories",
         providesTags: ["SupportOnlyCategories"]
      }),
      getSupportOnlyTickets: builder.query<
         SupportTicketsApiResponse,
         { page?: number; pageSize?: number } | void
      >({
         query: (args = {}) => ({
            url: "/api/support-only/tickets",
            params: {
               page: args?.page ?? 1,
               pageSize: args?.pageSize ?? 10
            }
         }),
         providesTags: result => [
            { type: "SupportOnlyTickets", id: "LIST" },
            ...(result?.data.map(ticket => ({
               type: "SupportOnlyTickets" as const,
               id: ticket.id
            })) ?? [])
         ]
      }),
      createSupportOnlyTicket: builder.mutation<
         CreateSupportTicketApiResponse,
         CreateSupportTicketPayload
      >({
         query: body => ({
            url: "/api/support-only/tickets",
            method: "POST",
            body
         }),
         invalidatesTags: [{ type: "SupportOnlyTickets", id: "LIST" }]
      }),
      getSupportOnlyTicket: builder.query<SupportTicketApiResponse, string>({
         query: ticketId => `/api/support-only/tickets/${ticketId}`,
         providesTags: (_result, _error, ticketId) => [
            { type: "SupportOnlyTickets", id: ticketId }
         ]
      }),
      addSupportOnlyMessage: builder.mutation<
         AddSupportMessageApiResponse,
         { ticketId: string; content: string }
      >({
         query: ({ ticketId, content }) => ({
            url: `/api/support-only/tickets/${ticketId}/messages`,
            method: "POST",
            body: { content }
         }),
         invalidatesTags: (_result, _error, { ticketId }) => [
            { type: "SupportOnlyTickets", id: ticketId },
            { type: "SupportOnlyTickets", id: "LIST" }
         ]
      })
   })
})

export const {
   useEndSupportAccessMutation,
   useGetSupportOnlySessionQuery,
   useGetSupportOnlyCategoriesQuery,
   useGetSupportOnlyTicketsQuery,
   useCreateSupportOnlyTicketMutation,
   useGetSupportOnlyTicketQuery,
   useAddSupportOnlyMessageMutation
} = supportOnlyApi
