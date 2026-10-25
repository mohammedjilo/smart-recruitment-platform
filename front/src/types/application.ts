import type { ApplicationStatus, QuestionType, ResumeType } from "./common/enums"
import type { ApiSuccessResponse, Meta } from "./common/pagination"
import type { CompanyApplication } from "./entities/application"
export type { ApplicationStatus, ResumeType } from "./common/enums"
export type {
   Application,
   CompanyApplication,
   CompanyApplicationJob,
   CompanyApplicationUser
} from "./entities/application"

export type UpdateApplicationStatus = Exclude<ApplicationStatus, "WITHDRAWN">

export type ApplicationMatchScore = "ALL" | "HIGH" | "GOOD" | "FAIR" | "LOW"

export type UpdateApplicationStatusArgs = {
   applicationId: string
   status: UpdateApplicationStatus
}

export type UpdateApplicationStatusResult = {
   success: true
   message?: string
   data?: CompanyApplication
}

export type ApplicationBody = {
   experiance?: string
   skills?: string[]
   description?: string
}

export type applyToJobBody = {
   fullName: string
   email: string
   phone: string
   country: string
   age: string
   jobTitle: string

   useProfessionalProfile: boolean

   answers: {
      questionId: string
      answer: string | string[]
   }[]
}
export type GetCompanyApplicationsResult = {
   success: true
   data: CompanyApplication[]
   meta: {
      totalCount: number
      page: number
      pageSize: number
   }
   stats: {
      totalApplications: number
      pending: number
      reviewing: number
      shortlisted: number
      interview: number
      rejected: number
   }
}

export type GetCompanyApplicationsParams = {
   pageNumber?: number
   pageSize?: number
   search?: string
   status?: ApplicationStatus
   matchScore?: Exclude<ApplicationMatchScore, "ALL">
   sort?: "newest" | "oldest"
}

export type UserApplicationListItem = {
   id: string
   status: ApplicationStatus
   matchScore: number | null
   createdAt: string
   job: {
      id: string
      title: string
      company: {
         companyName: string
         logoUrl: string | null
      }
   }
}

export type UserApplicationDetails = UserApplicationListItem & {
   userId: string
   jobId: string
   updatedAt: string
   recommendation: string | null
   strengths: unknown
   missingSkills: unknown
   resumeType: ResumeType
   cvId: string | null
   cvUrl: string | null
   answers: Array<{
      id: string
      answer: unknown
      question: {
         question: string
         type: QuestionType
         required: boolean
      }
   }>
}

export type UserApplication = UserApplicationListItem

export type GetMyApplicationsResult = ApiSuccessResponse<UserApplicationListItem[]> & {
   pagination?: Meta
}

export type GetMyApplicationDetailsResult = ApiSuccessResponse<UserApplicationDetails>
