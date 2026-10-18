import type {
   GetMyApplicationDetailsResult,
   GetMyApplicationsResult,
   GetCompanyApplicationsParams,
   GetCompanyApplicationsResult,
   UpdateApplicationStatusArgs,
   UpdateApplicationStatusResult
} from "@/types/api/applications"
import type { ApiSuccessResponse } from "@/types/common/pagination"
import type { ApplicationStatus } from "@/types/common/enums"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getMyApplications: builder.query<
         GetMyApplicationsResult,
         {
            page?: number
            pageSize?: number
            search?: string
            status?: ApplicationStatus
            matchScore?: "HIGH" | "GOOD" | "FAIR" | "LOW" | "UNSCORED"
            sortOrder?: "asc" | "desc"
         }
      >({
         query: ({
            page = 1,
            pageSize = 5,
            search,
            status,
            matchScore,
            sortOrder = "desc"
         }) => ({
            url: "/api/application/me",
            params: {
               page,
               pageSize,
               search: search || undefined,
               status: status || undefined,
               matchScore: matchScore || undefined,
               sortOrder
            }
         }),
         providesTags: result => [
            { type: "Applications", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }: { id: string }) => ({
               type: "Applications" as const,
               id
            })) ?? []),
            ...(result?.data.map(({ job }: { job: { id: string } }) => ({
               type: "Jobs" as const,
               id: job.id
            })) ?? [])
         ]
      }),
      getMyApplicationDetails: builder.query<
         GetMyApplicationDetailsResult,
         string
      >({
         query: applicationId => `/api/application/me/${applicationId}`,
         providesTags: (_result, _error, applicationId) => [
            { type: "Applications", id: applicationId }
         ]
      }),
      getApplicationsCompany: builder.query<
         GetCompanyApplicationsResult,
         GetCompanyApplicationsParams | void
      >({
         query: ({
            pageNumber = 1,
            pageSize = 6,
            search,
            status,
            sort = "newest"
         } = {}) => ({
            url: "/api/application/company",
            params: {
               pageNumber,
               pageSize,
               search: search || undefined,
               status,
               sortBy: "createdAt",
               sortOrder: sort === "newest" ? "desc" : "asc"
            }
         }),
         providesTags: result => [
            { type: "Applications", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Applications" as const, id })) ??
               []),
            ...(result?.data.map(({ job }) => ({ type: "Jobs" as const, id: job.id })) ??
               [])
         ]
      }),
      applyToJob: builder.mutation<
         ApiSuccessResponse<unknown>,
         { jobId: string; userId: string; companyId: string; formData: FormData }
      >({
         query: ({ jobId, formData }) => ({
            url: `/api/application/${jobId}`,
            method: "POST",
            body: formData
         }),
         invalidatesTags: (_result, _error, { jobId }) => [
            { type: "Applications", id: "PARTIAL-LIST" },
            { type: "Jobs", id: jobId },
            { type: "UserJobState", id: jobId }
         ]
      }),
      deleteApplication: builder.mutation<
         ApiSuccessResponse<unknown>,
         {
            applicationId: string
            userId: string
            jobId: string
            companyId: string
            conversationId?: string | null
         }
      >({
         query: ({ applicationId }) => ({
            url: `/api/application/${applicationId}`,
            method: "DELETE"
         }),
         invalidatesTags: [{ type: "Applications", id: "PARTIAL-LIST" }]
      }),
      updateApplicationStatus: builder.mutation<
         UpdateApplicationStatusResult,
         UpdateApplicationStatusArgs
      >({
         query: ({ applicationId, status }) => ({
            url: `/api/application/${applicationId}/status`,
            method: "PATCH",
            body: { status }
         }),
         invalidatesTags: [{ type: "Applications", id: "PARTIAL-LIST" }]
      }),
      withdrawApplication: builder.mutation<
         ApiSuccessResponse<unknown>,
         { applicationId: string; userId?: string; jobId?: string }
      >({
         query: ({ applicationId }) => ({
            url: `/api/application/${applicationId}/withdraw`,
            method: "PATCH"
         }),
         invalidatesTags: (_result, _error, { applicationId, jobId }) => [
            { type: "Applications", id: "PARTIAL-LIST" },
            { type: "Applications", id: applicationId },
            { type: "Jobs", id: jobId },
            { type: "UserJobState", id: jobId }
         ]
      })
   })
})
export const {
   useGetMyApplicationsQuery,
   useGetMyApplicationDetailsQuery,
   useGetApplicationsCompanyQuery,
   useApplyToJobMutation,
   useDeleteApplicationMutation,
   useUpdateApplicationStatusMutation,
   useWithdrawApplicationMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
