import type { ApplicationStatus, QuestionType, ResumeType } from "../common/enums"

export type { ApplicationStatus, ResumeType } from "../common/enums"

export type Application = {
   id: string
   status: ApplicationStatus | string
   matchScore?: number
   recommendation?: string
   strengths?: unknown
   missingSkills?: unknown
   createdAt: string
   updatedAt: string
   userId: string
   jobId: string
}

export type CompanyApplicationUser = {
   id: string
   firstName: string
   lastName: string
   email: string
   profilePicUrl: string | null
}

export type CompanyApplicationJob = {
   id: string
   title: string
   slug: string
}

export type CompanyApplication = Application & {
   status: ApplicationStatus
   matchScore: number | null
   recommendation: string | null
   strengths: unknown
   missingSkills: unknown
   resumeType: ResumeType
   cvId: string | null
   cvUrl: string | null
   profileSnapshot: unknown
   answers?: Array<{
      id: string
      answer: unknown
      question: {
         question: string
         type: QuestionType
         required: boolean
      }
   }>
   user: CompanyApplicationUser
   job: CompanyApplicationJob
}
