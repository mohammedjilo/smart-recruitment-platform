import type { ExperienceBody } from "@/types/api/profile"
import type { ApiSuccessResponse } from "@/types/common/pagination"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      addExperience: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; data: ExperienceBody }
      >({
         query: ({ data }) => ({
            url: "/api/experience",
            method: "POST",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateExperience: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; id: string; data: Partial<ExperienceBody> }
      >({
         query: ({ id, data }) => ({
            url: `/api/experience/${id}`,
            method: "PUT",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})
export const { useAddExperienceMutation, useUpdateExperienceMutation } = extendedSmartApi
export { extendedSmartApi as smartApi }
