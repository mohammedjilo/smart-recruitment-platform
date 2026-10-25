import type {
   AddUserLanguageBody,
   AddUserLanguageResult
} from "@/types/language"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      addUserLanguage: builder.mutation<
         AddUserLanguageResult,
         { userId: string; data: AddUserLanguageBody }
      >({
         query: ({ data }) => ({
            url: "/api/user-languages",
            method: "POST",
            body: data
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      }),
      updateUserLanguage: builder.mutation<
         AddUserLanguageResult,
         { userId: string; id: string; level: AddUserLanguageBody["level"] }
      >({
         query: ({ id, level }) => ({
            url: `/api/user-languages/${id}`,
            method: "PUT",
            body: { level }
         }),
         invalidatesTags: (_result, _error, { userId }) => [
            { type: "ProfessionalProfile", id: userId }
         ]
      })
   })
})

export const {
   useAddUserLanguageMutation,
   useUpdateUserLanguageMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
