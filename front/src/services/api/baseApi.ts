import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
   BaseQueryApi,
   BaseQueryFn
} from "@reduxjs/toolkit/query"
import {
   createReliableBaseQuery,
   interpretRefreshResult
} from "./requestReliability"
import type { RootState } from "@/redux/store"
import { authActions } from "@/redux/slices/authSlice"
import { normalizeApiError, type NormalizedApiError } from "@/utils/apiError"

const REQUEST_TIMEOUT_MS = 30_000

const apiBaseUrl =
   import.meta.env.VITE_API_BASE_URL ??
   (import.meta.env.DEV || import.meta.env.MODE === "test"
      ? "http://localhost:3000"
      : undefined)

if (!apiBaseUrl) {
   throw new Error("VITE_API_BASE_URL is required outside development and tests.")
}

const baseQuery = fetchBaseQuery({
   baseUrl: apiBaseUrl,
   timeout: REQUEST_TIMEOUT_MS,
   credentials: "include",
   prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) headers.set("Authorization", `Bearer ${token}`)
      return headers
   }
})

const clearSession = (api: BaseQueryApi) => clearSessionAndApiState(api.dispatch)

let accountDeactivationRedirectStarted = false

const isAccountDeactivatedError = (error: unknown) =>
   typeof error === "object" &&
   error !== null &&
   "data" in error &&
   typeof error.data === "object" &&
   error.data !== null &&
   "error" in error.data &&
   typeof error.data.error === "object" &&
   error.data.error !== null &&
   "code" in error.data.error &&
   error.data.error.code === "ACCOUNT_DEACTIVATED"

const baseQueryWithReauthAndRetry = createReliableBaseQuery({
   execute: (args, api, extraOptions) => baseQuery(args, api, extraOptions),
   shouldRefresh: args => {
      const url = typeof args === "string" ? args : args.url
      return url !== "/api/auth/login"
   },
   refresh: async (api, extraOptions) => {
      const refreshApi: BaseQueryApi = {
         ...api,
         signal: new AbortController().signal,
         type: "mutation"
      }
      const result = await baseQuery(
         { url: "/api/auth/refresh", method: "POST" },
         refreshApi,
         extraOptions
      )
      return interpretRefreshResult(result)
   },
   getToken: api => {
      const state = api.getState() as RootState
      return state.auth.token
   },
   setToken: (api, token) => {
      api.dispatch(authActions.setToken(token))
   },
   invalidateSession: clearSession
})

const baseQueryWithNormalizedErrors: BaseQueryFn<
   Parameters<typeof baseQueryWithReauthAndRetry>[0],
   unknown,
   NormalizedApiError
> = async (args, api, extraOptions) => {
   const result = await baseQueryWithReauthAndRetry(args, api, extraOptions)
   if ("error" in result && result.error !== undefined) {
      if (
         isAccountDeactivatedError(result.error) &&
         !accountDeactivationRedirectStarted
      ) {
         accountDeactivationRedirectStarted = true
         clearSession(api)
         if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/account-deactivated"
         ) {
            window.location.replace("/account-deactivated")
         }
      }
      return { ...result, error: normalizeApiError(result.error) }
   }
   return result
}

export const smartApi = createApi({
   reducerPath: "smartApi",
   keepUnusedDataFor: 0,
   baseQuery: baseQueryWithNormalizedErrors,
   endpoints: () => ({}),
   tagTypes: [
      "Companies",
      "ProfessionalProfile",
      "Jobs",
      "UserJobState",
      "SavedJobs",
      "JobQuestions",
      "ApplicationCounts",
      "CompanyApplicationCounts",
      "CompanyProfile",
      "CompanyAvailability",
      "CompanyDashboard",
      "UserDashboard",
      "OperationsDashboard",
      "CompanyRequests",
      "AdminDashboard",
      "AdminCompanies",
      "AdminUsers",
      "Admins",
      "AdminAuthorization",
      "AdminPermissions",
      "AdminRoles",
      "AdminUserDetails",
      "AdminCompanyDetails",
      "CompanyUsers",
      "Applications",
      "Notifications",
      "Conversations",
      "Messages",
      "SupportCategories",
      "SupportTickets",
      "SupportDashboard"
   ]
})

export const clearSessionAndApiState = (dispatch: BaseQueryApi["dispatch"]) => {
   dispatch(smartApi.util.resetApiState())
   dispatch(authActions.logout())
}
