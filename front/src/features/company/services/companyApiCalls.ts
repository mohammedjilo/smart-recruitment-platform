import type {
   GetCompanyJobByIdResult,
   GetCompanyJobsParams,
   GetCompanyJobsResult,
   GetDashboardCompanyResult,
   GetCompanyProfileResult,
   UpdateCompanyJobByIdArgs,
   GetCompanyUsersParams,
   GetCompanyUsersResult
} from "@/types/api/company"

import { smartApi } from "@/services/api/baseApi"
import { authActions } from "@/redux/slices/authSlice"

type UpdateCompanyProfileResponse = {
   success: true
   message?: string
   data: {
      id: string
      companyName: string
      email: string
      logoUrl: string | null
   }
}

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getDashboardComapny: builder.query<GetDashboardCompanyResult, void>({
         query: () => "/api/company/dashboard",
         providesTags: ["CompanyDashboard"]
      }),
      getCompanyProfile: builder.query<GetCompanyProfileResult, void>({
         query: () => "/api/company/profile",
         providesTags: result => [
            ...(result?.data.id
               ? [
                    { type: "CompanyProfile" as const, id: result.data.id },
                    { type: "CompanyApplicationCounts" as const, id: result.data.id }
                 ]
               : [])
         ]
      }),
      getCompanyUsers: builder.query<GetCompanyUsersResult, GetCompanyUsersParams | void>(
         {
            query: ({
               page = 1,
               search,
               experience,
               country,
               countryCode,
               city,
               cityGeonameId
            } = {}) => ({
               url: "/api/company/users",
               params: {
                  page,
                  search: search || undefined,
                  experience: experience === "ALL" ? undefined : experience,
                  country,
                  countryCode,
                  city,
                  cityGeonameId
               }
            }),
            providesTags: result => [
               { type: "CompanyUsers", id: "PARTIAL-LIST" },
               ...(result?.data.map(({ id }) => ({
                  type: "CompanyUsers" as const,
                  id
               })) ?? [])
            ]
         }
      ),
      updateCompanyProfile: builder.mutation<
         UpdateCompanyProfileResponse,
         { companyId: string; formData: FormData }
      >({
         query: ({ formData }) => ({
            url: "/api/company/profile",
            method: "PUT",
            body: formData
         }),
         invalidatesTags: (_result, _error, { companyId }) => [
            { type: "CompanyProfile", id: companyId }
         ],
         async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
            try {
               const { data } = await queryFulfilled
               dispatch(
                  authActions.updateUser({
                     id: data.data.id,
                     companyName: data.data.companyName,
                     email: data.data.email,
                     logoUrl: data.data.logoUrl ?? ""
                  })
               )
            } catch {
               // Keep the existing auth identity when the profile update fails.
            }
         }
      }),
      getCompanyJobs: builder.query<GetCompanyJobsResult, GetCompanyJobsParams>({
         query: params => ({
            url: "/api/company/jobs",
            params
         }),
         providesTags: result => [
            { type: "Jobs", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Jobs" as const, id })) ?? [])
         ]
      }),
      getCompanyJobById: builder.query<
         GetCompanyJobByIdResult,
         { id: string; slug: string }
      >({
         query: ({ id, slug }) => ({
            url: `/api/company/jobs/${id}/${slug}`
         }),
         providesTags: (_result, _error, { id }) => [
            { type: "Jobs", id },
            { type: "JobQuestions", id }
         ]
      }),
      updateCompanyJobById: builder.mutation<
         GetCompanyJobByIdResult,
         UpdateCompanyJobByIdArgs
      >({
         query: ({ id, body }) => ({
            url: `/api/company/jobs/${id}`,
            method: "PUT",
            body
         }),
         invalidatesTags: (_result, _error, { id }) => [{ type: "Jobs", id }]
      })
   })
})

export const {
   useGetDashboardComapnyQuery,
   useGetCompanyProfileQuery,
   useGetCompanyUsersQuery,
   useUpdateCompanyProfileMutation,
   useGetCompanyJobsQuery,
   useGetCompanyJobByIdQuery,
   useUpdateCompanyJobByIdMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
