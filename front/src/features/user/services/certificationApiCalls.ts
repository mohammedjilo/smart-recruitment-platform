import type { CertificateBody } from "@/types/api/profile"
import type { ApiSuccessResponse } from "@/types/common/pagination"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      addCertification: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; data: CertificateBody }
      >({
         query: ({ data }) => ({
            url: "/api/certificate",
            method: "POST",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateCertification: builder.mutation<
         ApiSuccessResponse<unknown>,
         { userId: string; id: string; data: Partial<CertificateBody> }
      >({
         query: ({ id, data }) => ({
            url: `/api/certificate/${id}`,
            method: "PUT",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})
export const { useAddCertificationMutation, useUpdateCertificationMutation } =
   extendedSmartApi
export { extendedSmartApi as smartApi }
