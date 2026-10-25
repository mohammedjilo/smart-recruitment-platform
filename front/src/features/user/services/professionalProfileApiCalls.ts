import type { GetProfessionalProfileBody } from "@/types/api/profile"
import type { UpdateProfessionalProfileRequest } from "@/types/api/professionalProfile"
import type { ApiSuccessResponse } from "@/types/common/pagination"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getProfessionalProfile: builder.query<GetProfessionalProfileBody, string>({
         query: () => "/api/professional-profile",
         providesTags: (_result, _error, userId) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateProfessionalProfile: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; data: UpdateProfessionalProfileRequest }
      >({
         query: ({ data }) => ({
            url: "/api/user/professional-profile",
            method: "PUT",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})
export const {
   useGetProfessionalProfileQuery,
   useUpdateProfessionalProfileMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
