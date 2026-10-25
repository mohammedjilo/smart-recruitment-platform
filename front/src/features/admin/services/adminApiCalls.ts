import type {
   CompanyRequestActionResult,
   GetAdminDashboardResponse,
   GetAllCompaniesParams,
   GetAllCompaniesResult,
   AdminJobsQuery,
   CompanyJobsQuery,
   GetCompanyDetailsResult,
   GetCompanyJobsByAdminResult,
   GetAdminCompanyApplicationsQuery,
   GetAdminCompanyApplicationsResult,
   GetCompanyRequestsParams,
   GetCompanyRequestsResult,
   GetJobDetailsByAdminResult,
   GetJobApplicationsByAdminResult,
   GetJobApplicationsParams,
   GetJobQuestionsByAdminResult,
   GetJobsByAdminResult,
   RejectCompanyRequestParams,
   GetApplicationDetailsByAdminResult,
   GetProfileSnapshotByAdminResult,
   GetApplicationsByAdminQuery,
   GetApplicationsByAdminResult,
   GetUsersByAdminQuery,
   GetUsersByAdminResult,
   GetUserDetailsByAdminResult,
   GetAdminUserProfessionalProfileResult,
   UpdateUserStatusByAdminArgs,
   UpdateUserStatusByAdminResult,
   UpdateCompanyStatusByAdminArgs,
   UpdateCompanyStatusByAdminResult
} from "@/types/api/admin"
import type { AdminPermissionsResponse } from "@/types/adminPermissions"
import type {
   AdminRolesResponse,
   AdminAuthorizationResponse,
   AdminSummaryResponse,
   AdminSummariesResponse,
   AssignAdminRoleArgs,
   UpdateAdminStatusArgs,
   CreateAdminArgs,
   CreateAdminResponse
} from "@/types/api/adminAuthorization"
import { smartApi } from "@/services/api/baseApi"

type OperationsDashboardResponse = {
   success: true
   data: {
      users: number
      companies: number
      jobs: number
      applications: number
   }
}

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getAdminDashboard: builder.query<GetAdminDashboardResponse, void>({
         query: () => "/api/admin/dashboard",
         providesTags: ["AdminDashboard"]
      }),
      getOperationsDashboard: builder.query<OperationsDashboardResponse, void>({
         query: () => "/api/admin/operations/dashboard",
         providesTags: ["OperationsDashboard"]
      }),
      getCurrentAdminPermissions: builder.query<AdminPermissionsResponse, string>({
         query: () => "/api/admin/me/permissions",
         providesTags: (_result, _error, userId) => [
            { type: "AdminPermissions", id: userId }
         ]
      }),
      getAdmins: builder.query<AdminSummariesResponse, void>({
         query: () => "/api/admin/admins",
         providesTags: result => [
            { type: "Admins", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Admins" as const, id })) ?? [])
         ]
      }),
      getAdminAuthorization: builder.query<AdminAuthorizationResponse, string>({
         query: userId => `/api/admin/admins/${userId}/permissions`,
         providesTags: (_result, _error, userId) => [
            { type: "AdminAuthorization", id: userId }
         ]
      }),
      createAdmin: builder.mutation<CreateAdminResponse, CreateAdminArgs>({
         query: body => ({
            url: "/api/admin/admins",
            method: "POST",
            body
         }),
         invalidatesTags: [{ type: "Admins", id: "PARTIAL-LIST" }]
      }),
      getAdminRoles: builder.query<AdminRolesResponse, void>({
         query: () => "/api/admin/roles",
         providesTags: [{ type: "AdminRoles", id: "LIST" }]
      }),
      assignAdminRole: builder.mutation<AdminSummaryResponse, AssignAdminRoleArgs>({
         query: ({ userId, roleName }) => ({
            url: `/api/admin/admins/${userId}/role`,
            method: "PATCH",
            body: { roleName }
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "Admins", id: "PARTIAL-LIST" },
            { type: "Admins", id: userId }
         ]
      }),
      updateAdminStatus: builder.mutation<AdminSummaryResponse, UpdateAdminStatusArgs>({
         query: ({ userId, status }) => ({
            url: `/api/admin/admins/${userId}/status`,
            method: "PATCH",
            body: { status }
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "Admins", id: "PARTIAL-LIST" },
            { type: "Admins", id: userId }
         ]
      }),
      getAllCompanies: builder.query<GetAllCompaniesResult, GetAllCompaniesParams | void>(
         {
            query: ({
               page = 1,
               sortByNewest = true,
               status,
               approvalStatus,
               country,
               countryCode,
               city,
               cityGeonameId
            } = {}) => ({
               url: "/api/admin/companies",
               params: {
                  page,
                  sortByNewest,
                  status: status === "ALL" ? undefined : status,
                  approvalStatus: approvalStatus === "ALL" ? undefined : approvalStatus,
                  country,
                  countryCode,
                  city,
                  cityGeonameId
               }
            }),
            providesTags: result => [
               { type: "AdminCompanies", id: "PARTIAL-LIST" },
               ...(result?.data.map(({ id }) => ({
                  type: "AdminCompanies" as const,
                  id
               })) ?? [])
            ]
         }
      ),
      getCompanyDetailsByAdmin: builder.query<GetCompanyDetailsResult, string>({
         query: id => `/api/admin/companies/${id}`,
         providesTags: (result, _error, id) => [
            { type: "AdminCompanyDetails", id },
            { type: "CompanyApplicationCounts", id },
            ...(result?.data.recentJobs.map(({ id: jobId }) => ({
               type: "Jobs" as const,
               id: jobId
            })) ?? []),
            ...(result?.data.recentJobs.map(({ id: jobId }) => ({
               type: "ApplicationCounts" as const,
               id: jobId
            })) ?? [])
         ]
      }),
      updateCompanyStatusByAdmin: builder.mutation<
         UpdateCompanyStatusByAdminResult,
         UpdateCompanyStatusByAdminArgs
      >({
         query: ({ id, status }) => ({
            url: `/api/admin/companies/${id}/status`,
            method: "PATCH",
            body: { status }
         }),
         invalidatesTags: (_result, _error, { id }) => [
            { type: "AdminCompanies", id: "PARTIAL-LIST" },
            { type: "AdminCompanyDetails", id }
         ]
      }),
      getCompanyJobsByAdmin: builder.query<
         GetCompanyJobsByAdminResult,
         { id: string } & CompanyJobsQuery
      >({
         query: ({ id, page = 1, search, status, employmentType }) => ({
            url: `/api/admin/companies/${id}/jobs`,
            params: {
               page,
               search: search || undefined,
               status: status === "ALL" ? undefined : status,
               employmentType: employmentType === "ALL" ? undefined : employmentType
            }
         }),
         providesTags: result => [
            { type: "Jobs", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({
               type: "ApplicationCounts" as const,
               id
            })) ?? []),
            ...(result?.data.map(({ id }) => ({ type: "Jobs" as const, id })) ?? [])
         ]
      }),
      getCompanyApplicationsByAdmin: builder.query<
         GetAdminCompanyApplicationsResult,
         GetAdminCompanyApplicationsQuery
      >({
         query: ({ companyId, page = 1, pageSize = 10, search, status, matchScore }) => ({
            url: `/api/admin/companies/${companyId}/applications`,
            params: {
               page,
               pageSize,
               search: search || undefined,
               status: status === "ALL" ? undefined : status,
               matchScore: matchScore === "ALL" ? undefined : matchScore
            }
         }),
         providesTags: (result, _error, { companyId }) => [
            { type: "Applications", id: `COMPANY-${companyId}` },
            ...(result?.data.map(({ id }) => ({
               type: "Applications" as const,
               id
            })) ?? [])
         ]
      }),
      getJobsByAdmin: builder.query<GetJobsByAdminResult, AdminJobsQuery | void>({
         query: ({ page = 1, search, status, employmentType } = {}) => ({
            url: "/api/admin/jobs",
            params: {
               page,
               search: search || undefined,
               status: status === "ALL" ? undefined : status,
               employmentType: employmentType === "ALL" ? undefined : employmentType
            }
         }),
         providesTags: result => [
            { type: "Jobs", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({
               type: "ApplicationCounts" as const,
               id
            })) ?? []),
            ...(result?.data.map(({ id }) => ({ type: "Jobs" as const, id })) ?? []),
            ...(result?.data.map(({ company }) => ({
               type: "Companies" as const,
               id: company.id
            })) ?? [])
         ]
      }),
      getJobDetailsByAdmin: builder.query<GetJobDetailsByAdminResult, string>({
         query: id => `/api/admin/jobs/${id}`,
         providesTags: (result, _error, id) => [
            { type: "Jobs", id },
            { type: "ApplicationCounts", id },
            ...(result?.data.company.id
               ? [{ type: "Companies" as const, id: result.data.company.id }]
               : [])
         ]
      }),
      getJobQuestionsByAdmin: builder.query<GetJobQuestionsByAdminResult, string>({
         query: id => `/api/admin/jobs/${id}/questions`,
         providesTags: (_result, _error, id) => [{ type: "JobQuestions", id }]
      }),
      getJobApplicationsByAdmin: builder.query<
         GetJobApplicationsByAdminResult,
         { id: string } & GetJobApplicationsParams
      >({
         query: ({ id, page = 1, search, status, experience, matchScore }) => ({
            url: `/api/admin/jobs/${id}/applications`,
            params: {
               page,
               search: search || undefined,
               status: status === "ALL" ? undefined : status,
               experience: experience === "ALL" ? undefined : experience,
               matchScore: matchScore === "ALL" ? undefined : matchScore
            }
         }),
         providesTags: result => [
            { type: "Applications", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Applications" as const, id })) ??
               [])
         ]
      }),
      getApplicationsByAdmin: builder.query<
         GetApplicationsByAdminResult,
         GetApplicationsByAdminQuery | void
      >({
         query: ({ page = 1, search, status, experience, matchScore } = {}) => ({
            url: "/api/admin/applications",
            params: {
               page,
               search: search || undefined,
               status: status === "ALL" ? undefined : status,
               experience: experience === "ALL" ? undefined : experience,
               matchScore: matchScore === "ALL" ? undefined : matchScore
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
      getUsersByAdmin: builder.query<GetUsersByAdminResult, GetUsersByAdminQuery | void>({
         query: ({
            page = 1,
            search,
            role,
            status,
            country,
            countryCode,
            city,
            cityGeonameId
         } = {}) => ({
            url: "/api/admin/users",
            params: {
               page,
               search: search || undefined,
               role: role === "ALL" ? undefined : role,
               status: status === "ALL" ? undefined : status,
               country,
               countryCode,
               city,
               cityGeonameId
            }
         }),
         providesTags: result => [
            { type: "AdminUsers", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "AdminUsers" as const, id })) ?? [])
         ]
      }),
      getUserDetailsByAdmin: builder.query<GetUserDetailsByAdminResult, string>({
         query: id => `/api/admin/users/${id}`,
         providesTags: (_result, _error, id) => [{ type: "AdminUserDetails", id }]
      }),
      getAdminUserProfessionalProfile: builder.query<
         GetAdminUserProfessionalProfileResult,
         string
      >({
         query: userId => `/api/admin/users/${userId}/professional-profile`,
         providesTags: (_result, _error, userId) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateUserStatusByAdmin: builder.mutation<
         UpdateUserStatusByAdminResult,
         UpdateUserStatusByAdminArgs
      >({
         query: ({ id, status }) => ({
            url: `/api/admin/users/${id}/status`,
            method: "PATCH",
            body: { status }
         }),
         invalidatesTags: (_result, _error, { id }) => [
            { type: "AdminUsers", id: "PARTIAL-LIST" },
            { type: "AdminUserDetails", id }
         ]
      }),
      getApplicationDetailsByAdmin: builder.query<
         GetApplicationDetailsByAdminResult,
         string
      >({
         query: id => `/api/admin/applications/${id}`,
         providesTags: (result, _error, id) => [
            { type: "Applications", id },
            ...(result?.data.job.id
               ? [{ type: "Jobs" as const, id: result.data.job.id }]
               : [])
         ]
      }),
      getCompanyRequests: builder.query<
         GetCompanyRequestsResult,
         GetCompanyRequestsParams | void
      >({
         query: ({
            pageNumber = 1,
            pageSize = 10,
            search,
            approvalStatus,
            status,
            requestDate
         } = {}) => ({
            url: "/api/admin/company-requests",
            params: {
               pageNumber,
               pageSize,
               search: search || undefined,
               approvalStatus: approvalStatus === "ALL" ? undefined : approvalStatus,
               status: status === "ALL" ? undefined : status,
               requestDate: requestDate || undefined
            }
         }),
         providesTags: result => [
            { type: "CompanyRequests", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({
               type: "CompanyRequests" as const,
               id
            })) ?? [])
         ]
      }),
      approveCompanyRequest: builder.mutation<CompanyRequestActionResult, string>({
         query: id => ({
            url: `/api/admin/companies/${id}/approve`,
            method: "PATCH"
         }),
         invalidatesTags: [{ type: "CompanyRequests", id: "PARTIAL-LIST" }]
      }),
      rejectCompanyRequest: builder.mutation<
         CompanyRequestActionResult,
         RejectCompanyRequestParams
      >({
         query: ({ id, rejectionReason }) => ({
            url: `/api/admin/companies/${id}/reject`,
            method: "PATCH",
            body: rejectionReason ? { rejectionReason } : undefined
         }),
         invalidatesTags: [{ type: "CompanyRequests", id: "PARTIAL-LIST" }]
      }),
      getProfileSnapshotByAdmin: builder.query<GetProfileSnapshotByAdminResult, string>({
         query: applicationId =>
            `/api/admin/applications/${applicationId}/profile-snapshot`,
         providesTags: (_result, _error, applicationId) => [
            { type: "Applications", id: applicationId }
         ]
      })
   })
})

export const {
   useGetAdminDashboardQuery,
   useGetOperationsDashboardQuery,
   useGetAllCompaniesQuery,
   useGetCompanyDetailsByAdminQuery,
   useUpdateCompanyStatusByAdminMutation,
   useGetCompanyJobsByAdminQuery,
   useGetCompanyApplicationsByAdminQuery,
   useGetJobsByAdminQuery,
   useGetJobDetailsByAdminQuery,
   useGetJobQuestionsByAdminQuery,
   useGetJobApplicationsByAdminQuery,
   useGetApplicationsByAdminQuery,
   useGetUsersByAdminQuery,
   useGetUserDetailsByAdminQuery,
   useGetAdminUserProfessionalProfileQuery,
   useUpdateUserStatusByAdminMutation,
   useGetApplicationDetailsByAdminQuery,
   useGetProfileSnapshotByAdminQuery,
   useGetCompanyRequestsQuery,
   useApproveCompanyRequestMutation,
   useRejectCompanyRequestMutation,
   useGetCurrentAdminPermissionsQuery,
   useGetAdminsQuery,
   useGetAdminAuthorizationQuery,
   useCreateAdminMutation,
   useGetAdminRolesQuery,
   useAssignAdminRoleMutation,
   useUpdateAdminStatusMutation
} = extendedSmartApi

export { extendedSmartApi as smartApi }
