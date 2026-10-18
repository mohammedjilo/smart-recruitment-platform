import type { EducationBody } from "@/types/api/profile"
import type { ApiSuccessResponse } from "@/types/common/pagination"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      addEducation: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; data: EducationBody }
      >({
         query: ({ data }) => ({
            url: "/api/education",
            method: "POST",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateEducation: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; id: string; data: Partial<EducationBody> }
      >({
         query: ({ id, data }) => ({
            url: `/api/education/${id}`,
            method: "PUT",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})
export const { useAddEducationMutation, useUpdateEducationMutation } = extendedSmartApi
export { extendedSmartApi as smartApi }
