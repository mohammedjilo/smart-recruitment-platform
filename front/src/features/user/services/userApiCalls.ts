import type {
   GetUserProfileDataResult,
   GetCompleteUserProfileResult,
   GetCompaniesResult,
   GetCompaniesParams,
   GetCompanyDetailsForUserResult,
   GetCompanyJobsResult,
   GetCompanyJobsParams,
   UpdateUserPersonalInformationResult
} from "@/types/api/user"
import type { PersonalInformationUpdateInput } from "@smart-recruitment/validation"
import { smartApi } from "@/services/api/baseApi"
const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getCompleteUserProfile: builder.query<GetCompleteUserProfileResult, string>({
         query: userId => `/api/user/profile/${userId}`,

         providesTags: (_result, _error, userId) => [
            "ProfessionalProfile",
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateUserPersonalInformation: builder.mutation<
         UpdateUserPersonalInformationResult,
         { userId: string; data: PersonalInformationUpdateInput }
      >({
         query: ({ data }) => ({
            url: "/api/user/profile",
            method: "PUT",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            "ProfessionalProfile",
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      getDashboardData: builder.query<GetUserProfileDataResult, void>({
         query: () => "/api/user/dashboard",
         providesTags: ["UserDashboard"]
      }),
      getCompanies: builder.query<GetCompaniesResult, GetCompaniesParams | void>({
         query: ({
            page = 1,
            pageSize = 10,
            search,
            country,
            countryCode,
            city,
            cityGeonameId
         } = {}) => ({
            url: "/api/user/companies",
            params: {
               page,
               pageSize,
               search: search || undefined,
               country,
               countryCode,
               city,
               cityGeonameId
            }
         }),
         providesTags: result => [
            { type: "Companies", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "Companies" as const, id })) ?? [])
         ]
      }),
      getCompanyDetailsForUser: builder.query<GetCompanyDetailsForUserResult, string>({
         query: id => `/api/user/companies/${id}`,
         providesTags: (_result, _error, id) => [{ type: "Companies", id }]
      }),
      getCompanyJobsForUser: builder.query<GetCompanyJobsResult, GetCompanyJobsParams>({
         query: ({ companyId, pageNumber = 1, search }) => ({
            url: `/api/user/companies/${companyId}/jobs`,
            params: {
               pageNumber,
               search: search || undefined
            }
         }),
         providesTags: (result, _error, { companyId }) => [
            { type: "CompanyAvailability", id: companyId },
            { type: "Jobs", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "UserJobState" as const, id })) ??
               []),
            ...(result?.data.map(({ id }) => ({ type: "Jobs" as const, id })) ?? [])
         ]
      })
   })
})

export const {
   useGetCompleteUserProfileQuery,
   useUpdateUserPersonalInformationMutation,
   useGetDashboardDataQuery,
   useGetCompaniesQuery,
   useGetCompanyDetailsForUserQuery,
   useGetCompanyJobsForUserQuery
} = extendedSmartApi
export { extendedSmartApi as smartApi }
