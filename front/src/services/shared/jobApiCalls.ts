import type { EmploymentType } from "@/types/job"
import type {
   GetBasicInformationsResult,
   GetJobByIdResult,
   GetJobsResult,
   GetQuestionsResult,
   GetSaveJobsResult,
   ToggleSaveJobsResult,
   UpdateJobStatusArgs,
   UpdateJobStatusResult
} from "@/types/api/jobs"
import type { CreateApplicationPayload, CreateApplicationResult } from "@/types/api/jobs"
import { smartApi } from "@/services/api/baseApi"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getJobs: builder.query<
         GetJobsResult,
         { pageNumber?: number; search?: string; employmentType?: EmploymentType }
      >({
         query: ({ pageNumber = 1, search = "", employmentType }) => ({
            url: "/api/jobs",
            params: {
               pageNumber,
               search: search || undefined,
               employmentType
            }
         }),
         providesTags: result => [
            { type: "Jobs", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "UserJobState" as const, id })) ??
               []),
            ...(result?.data.map(({ id }) => ({ type: "Jobs" as const, id })) ?? []),
            ...(result?.data.map(({ company }) => ({
               type: "Companies" as const,
               id: company.id
            })) ?? [])
         ]
      }),
      getJobById: builder.query<GetJobByIdResult, { id: string; slug: string }>({
         query: ({ id, slug }) => ({
            url: `/api/jobs/${id}/${slug}`
         }),
         providesTags: (result, _error, { id }) => [
            { type: "Jobs", id },
            { type: "UserJobState", id },
            ...(result?.data.company.id
               ? [{ type: "Companies" as const, id: result.data.company.id }]
               : [])
         ]
      }),
      getQuestions: builder.query<GetQuestionsResult, { id: string }>({
         query: ({ id }) => ({
            url: `/api/jobs/${id}/questions`
         }),
         providesTags: (_result, _error, { id }) => [{ type: "JobQuestions", id }]
      }),
      getBasicInformations: builder.query<GetBasicInformationsResult, void>({
         query: () => ({
            url: `/api/jobs/info`
         }),
         providesTags: result =>
            result?.data.id ? [{ type: "ProfessionalProfile", id: result.data.id }] : []
      }),
      createApplication: builder.mutation<
         CreateApplicationResult,
         CreateApplicationPayload
      >({
         query: body => ({
            url: "/api/jobs",
            method: "POST",
            body
         })
      }),
      getSaveJobs: builder.query<GetSaveJobsResult, { pageNumber?: number }>({
         query: ({ pageNumber = 1 }) => ({
            url: "/api/jobs/saved",
            params: {
               pageNumber
            }
         }),
         providesTags: result => [
            { type: "SavedJobs", id: "PARTIAL-LIST" },
            ...(result?.data.map(({ id }) => ({ type: "UserJobState" as const, id })) ??
               []),
            ...(result?.data.map(({ id }) => ({ type: "SavedJobs" as const, id })) ?? []),
            ...(result?.data.map(({ company }) => ({
               type: "Companies" as const,
               id: company.id
            })) ?? [])
         ]
      }),
      toggleSaveJobs: builder.mutation<ToggleSaveJobsResult, { jobId: string }>({
         query: ({ jobId }) => ({
            url: "/api/jobs/saved/toggle",
            method: "POST",
            body: { jobId }
         }),

         invalidatesTags: (_result, _error, { jobId }) => [
            { type: "SavedJobs", id: "PARTIAL-LIST" },
            { type: "UserJobState", id: jobId }
         ]
      }),
      updateJobStatus: builder.mutation<UpdateJobStatusResult, UpdateJobStatusArgs>({
         query: ({ id, status, deadline }) => ({
            url: `/api/jobs/${id}/status`,
            method: "PATCH",
            body: { status, ...(deadline ? { deadline } : {}) }
         }),
         invalidatesTags: (_result, _error, { id }) => [
            { type: "Jobs", id: "PARTIAL-LIST" },
            { type: "Jobs", id }
         ]
      })
   })
})
export const {
   useGetJobsQuery,
   useGetJobByIdQuery,
   useGetQuestionsQuery,
   useGetBasicInformationsQuery,
   useCreateApplicationMutation,
   useGetSaveJobsQuery,
   useToggleSaveJobsMutation,
   useUpdateJobStatusMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
