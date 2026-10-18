import type {
   AddUserLanguageBody,
   AddUserLanguageResult,
   CreateLanguageBody,
   CreateLanguageResult
} from "@/types/language"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      createLanguage: builder.mutation<CreateLanguageResult, CreateLanguageBody>({
         query: body => ({
            url: "/api/languages",
            method: "POST",
            body
         })
      }),
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
   useCreateLanguageMutation,
   useAddUserLanguageMutation,
   useUpdateUserLanguageMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
