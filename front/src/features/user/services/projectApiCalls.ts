import type { ProjectBody } from "@/types/api/profile"
import type { ApiSuccessResponse } from "@/types/common/pagination"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      addProject: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; data: ProjectBody }
      >({
         query: ({ data }) => ({
            url: "/api/project",
            method: "POST",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateProject: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; id: string; data: Partial<ProjectBody> }
      >({
         query: ({ id, data }) => ({
            url: `/api/project/${id}`,
            method: "PUT",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})
export const { useAddProjectMutation, useUpdateProjectMutation } = extendedSmartApi
export { extendedSmartApi as smartApi }
