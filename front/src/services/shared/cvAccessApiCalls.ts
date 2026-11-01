import type { ApiSuccessResponse } from "@/types/common/pagination"
import { smartApi } from "@/services/api/baseApi"

export type CvAccessTarget =
   | { scope: "candidate-application"; id: string }
   | { scope: "company-application"; id: string }
   | { scope: "admin-application"; id: string }
   | { scope: "candidate-profile"; id: string }
   | { scope: "admin-profile"; id: string }

const getCvPath = ({ scope, id }: CvAccessTarget) => {
   const encodedId = encodeURIComponent(id)
   switch (scope) {
      case "candidate-application":
      case "company-application":
         return `/api/application/${encodedId}/cv`
      case "admin-application":
         return `/api/admin/applications/${encodedId}/cv`
      case "candidate-profile":
         return "/api/user/professional-profile/cv"
      case "admin-profile":
         return `/api/admin/users/${encodedId}/professional-profile/cv`
   }
}

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      requestCvDownload: builder.mutation<
         ApiSuccessResponse<{ url: string; expiresAt: string }>,
         CvAccessTarget
      >({
         query: target => ({
            url: getCvPath(target),
            method: "GET",
            cache: "no-store"
         })
      })
   })
})

export const { useRequestCvDownloadMutation } = extendedSmartApi
