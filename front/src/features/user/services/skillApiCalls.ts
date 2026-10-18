import { smartApi } from "@/services/api/baseApi"
import type { ApiSuccessResponse } from "@/types/common/pagination"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      addSkills: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; skills: string[] }
      >({
         query: ({ skills }) => ({
            url: "/api/skill/me",
            method: "POST",
            body: { skills }
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateSkills: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; skills: string[] }
      >({
         query: ({ skills }) => ({
            url: "/api/skill/me",
            method: "PUT",
            body: { skills }
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})
export const { useAddSkillsMutation, useUpdateSkillsMutation } = extendedSmartApi
export { extendedSmartApi as smartApi }
