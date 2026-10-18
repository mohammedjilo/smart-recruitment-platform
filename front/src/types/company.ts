// import type { ApplicationStatus } from "@/features/user/components/application/Statistics"
import type { ApplicationStatus } from "./common/enums"
import type { Company as CompanyEntity } from "./entities/company"
import type { CreateApplicationPayload } from "./createJob.types"
import type { EmploymentType, JobStatus, QuestionType } from "./common/enums"
export type Company = CompanyEntity
export type {
   ApplicationStatus,
   EmploymentType,
   JobStatus,
   QuestionType
} from "./common/enums"
export type GetDashboardCompanyResult = {
   success: true
   data: {
      stats: {
         activeJobs: number
         totalApplications: number
         interviews: number
      }
      recentApplications: {
         status: ApplicationStatus
         createdAt: Date
         matchScore: number | null
         user: {
            id: string
            firstName: string
            lastName: string
            email: string
            profilePicUrl: string
         }
         job: {
            id: string
            title: string
            slug: string
         }
      }[]
      recentJobs: {
         status: JobStatus
         id: string
         title: string
         slug: string
         employmentType: EmploymentType
         _count: {
            applications: number
         }
      }[]
      topJobs: {
         id: string
         title: string
         employmentType: EmploymentType
         slug: string
         _count: {
            applications: number
         }
      }[]
   }
}

export type GetCompanyJobsResult = {
   success: true
   data: {
      companyId: string
      status: JobStatus
      id: string
      title: string
      description: string
      employmentType: EmploymentType
      salary: number | null
      deadline: Date
      experienceRequired: number
      slug: string
      createdAt: Date
      updatedAt: Date
   }[]
   meta: {
      totalCount: number
      page: number
      pageSize: number
   }
   stats: {
      totalJobs: number
      draft: number
      open: number
      closed: number
      expired: number
   }
}

export type GetCompanyJobsParams = {
   pageNumber?: number
   pageSize?: number
   search?: string
   status?: JobStatus
   employmentType?: EmploymentType
   sortBy?: string
   sortOrder?: string
}

export type { Skill } from "./entities/skill"
import type { Skill } from "./entities/skill"

export type JobSkill = {
   id: string
   createdAt: string
   updatedAt: string
   jobId: string
   skillId: string
   skill: Skill
}

export type JobQuestion = {
   id: string
   question: string
   type: QuestionType
   required: boolean
   order: number
   options: string[] | null
   minSelection: number | null
   maxSelection: number | null
   minNumber: number | null
   maxNumber: number | null
   jobId: string
   createdAt: string
   updatedAt: string
}

export type CompanyJob = {
   id: string
   title: string
   description: string
   employmentType: EmploymentType
   salary: number | null
   status: JobStatus
   deadline: string
   experienceRequired: number
   slug: string
   createdAt: string
   updatedAt: string
   companyId: string

   skills: JobSkill[]
   applicationQuestions: JobQuestion[]
}

export type UpdateCompanyJobByIdArgs = {
   id: string
   body: Partial<CreateApplicationPayload>
}

export type GetCompanyJobByIdResult = {
   success: true
   data: CompanyJob
}

export type GetCompanyProfileResult = {
   success: true
   data: Company & {
      stats: {
         totalJobsPosted: number
         totalApplicationsReceived: number
      }
   }
}
////////
export type ExperienceFilter = "ALL" | "0-2" | "3-5" | "6+"

export type CompanyUser = {
   id: string
   firstName: string
   lastName: string
   email: string
   phone: string
   country: string
   state: string | null
   city: string | null
   profilePicId: string | null
   profilePicUrl: string | null
   createdAt: string

   professionalProfile: {
      jobTitle: string | null
      summary: string | null
      yearsOfExperience: number | null
   } | null

   skills: string[]
}

export type GetCompanyUsersResult = {
   success: true
   data: CompanyUser[]
   meta: {
      totalCount: number
      page: number
      pageSize: number
   }
}

export type GetCompanyUsersParams = {
   page?: number
   search?: string
   experience?: ExperienceFilter
   country?: string
   countryCode?: string
   city?: string
   cityGeonameId?: number
}
