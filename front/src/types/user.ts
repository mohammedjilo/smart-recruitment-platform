import type {
   CompanyApprovalStatus,
   CompanyStatus,
   EmploymentType,
   JobStatus
} from "./common/enums"
import type {
   CompleteUserProfile as CompleteUserProfileEntity,
   User as UserEntity
} from "./entities/user"
import type { CompanySummary } from "./entities/company"
export type {
   Education,
   Experience,
   Project,
   Certificate,
   ProfessionalProfile,
   UserLanguage,
   UserSkill,
   UserProfileStats
} from "./entities"
export type { CompanySummary } from "./entities/company"
export type {
   AccountStatus,
   CompanyApprovalStatus,
   CompanyStatus,
   EmploymentType,
   JobStatus,
   UserRole
} from "./common/enums"

export type User = UserEntity
export type GetUserProfileBody = {
   username: string
}
export type GetUserProfileResult = {
   name: string
   username: string
   age: string
}
export type UpdateProfileBody = {
   name?: string
   bio?: string
   birthdate?: string
}

export type UpdateProfileResult = {
   name?: string
   bio?: string
   birthdate?: string
}

export type GetUserProfileDataResult = {
   status: string
   data: {
      stats: {
         savedJobs: number
         applications: number
         notificationsCount: number
      }
      recentApplications: {
         id: string
         status: string
         createdAt: string
         job: {
            id: string
            title: string
            slug: string
            company: {
               id: string
               companyName: string
               slug: string
               logoUrl: string
            }
         }
      }[]
      recommendedJobs: {
         id: string
         title: string
         slug: string
         salary: number
         createdAt: string
         skills: string[]
         company: {
            id: string
            companyName: string
            slug: string
            logoUrl: string
            location: string
         }
         matchScore: number
         recommendation: string
      }[]
   }
}
export type RecommendedJob = GetUserProfileDataResult["data"]["recommendedJobs"][0]
export type RecentApplication = GetUserProfileDataResult["data"]["recentApplications"][0]
//////////
export type CompleteUserProfile = CompleteUserProfileEntity

export type GetCompleteUserProfileResult = {
   status: string
   data: CompleteUserProfile
}

export type UpdateUserPersonalInformationResult = {
   success: true
   message?: string
   data: Pick<
      CompleteUserProfile,
      | "id"
      | "phone"
      | "birthdate"
      | "country"
      | "countryCode"
      | "state"
      | "stateCode"
      | "city"
      | "cityGeonameId"
      | "updatedAt"
   >
}
/////////
export type Company = CompanySummary

export type CompaniesPagination = {
   totalCount: number
   page: number
   pageSize: number
}

export type CompaniesResult = {
   companies: Company[]
   pagination: CompaniesPagination
}

export type GetCompaniesResult = {
   success: true
   data: Company[]
   meta: CompaniesPagination
}

export type GetCompaniesParams = {
   page?: number
   pageSize?: number
   search?: string
   country?: string
   countryCode?: string
   city?: string
   cityGeonameId?: number
}
////////////
export type CompanyProfileDetails = {
   id: string
   companyName: string
   slug: string
   description: string | null
   logoId: string | null
   logoUrl: string | null
   status: CompanyStatus
   approvalStatus: CompanyApprovalStatus
   website: string | null
   location: string | null
   phone: string
   email: string
   createdAt: string
   updatedAt: string
}

export type CompanyJobsStats = {
   total: number
   open: number
   closed: number
   expired: number
}

export type CompanyDetails = {
   company: CompanyProfileDetails
   jobs: CompanyJobsStats
}

export type GetCompanyDetailsForUserResult = {
   status: string
   data: CompanyDetails
}
//////////
export type CompanyJobSkill = {
   skill: {
      skillName: string
   }
}

export type CompanyJob = {
   id: string
   title: string
   salary: number | null
   status: JobStatus
   employmentType: EmploymentType
   experienceRequired: number
   slug: string
   createdAt: string
   isSaved: boolean
   isApplied: boolean
   hasWithdrawnApplication?: boolean
}

export type CompanyJobsPagination = {
   totalCount: number
   page: number
   pageSize: number
}
export type GetCompanyJobsParams = {
   companyId: string
   pageNumber?: number
   search?: string
}
export type CompanyJobsResult = {
   jobs: CompanyJob[]
   pagination: CompanyJobsPagination
}

export type GetCompanyJobsResult = {
   success: true
   data: CompanyJob[]
   meta: CompanyJobsPagination
}
