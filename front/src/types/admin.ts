import type {
   ApplicationStatus,
   CompanyApprovalStatus,
   CompanyStatus,
   EmploymentType,
   ExperienceFilter,
   JobStatus,
   ResumeType,
   UserRole,
   UserStatus
} from "./common/enums"
import type { Company } from "./company"
import type { ApplicationMatchScore } from "./application"
import type { QuestionType } from "./question.types"
import type { ProfessionalProfile } from "./entities/user"
import type { ProfileSnapshot } from "./profileSnapshot"

export type { ProfileSnapshot } from "./profileSnapshot"
import type { Skill } from "./entities/skill"
import type { UserLanguage } from "./entities/language"
export type {
   ApplicationStatus,
   CompanyApprovalStatus,
   CompanyStatus,
   EmploymentType,
   ExperienceFilter,
   JobStatus,
   ResumeType,
   UserRole,
   UserStatus
} from "./common/enums"

export type AdminDashboardStats = {
   totalCompanies: number
   totalUsers: number
   totalJobs: number
   totalApplications: number
   totalSupportTickets: number
   openSupportTickets: number
}

export type CompanyRequest = {
   id: string
   companyName: string
   slug: string
   email: string
   logoUrl: string | null
   location: string | null
   status: CompanyStatus
   approvalStatus: CompanyApprovalStatus
   createdAt: string
}

export type DashboardJobCompany = {
   id: string
   companyName: string
   slug: string
   logoUrl: string | null
}

export type DashboardJob = {
   id: string
   title: string
   slug: string
   status: JobStatus
   createdAt: string
   company: DashboardJobCompany
   _count: {
      applications: number
   }
}

export type TopCompany = {
   id: string
   companyName: string
   slug: string
   logoUrl: string | null
   status: CompanyStatus
   approvalStatus: CompanyApprovalStatus
   _count: {
      jobs: number
   }
}

export type AdminDashboard = {
   stats: AdminDashboardStats
   companyRequests: CompanyRequest[]
   latestJobs: DashboardJob[]
   topCompaniesByJobs: TopCompany[]
   topJobsByApplications: DashboardJob[]
}

export type GetAdminDashboardResponse = {
   success: true
   data: AdminDashboard
}
///////////////
export type CompanyRequests = {
   id: string
   companyName: string
   slug: string
   logoId: string | null
   logoUrl: string | null
   phone: string
   email: string
   location: string | null
   status: CompanyStatus
   approvalStatus: CompanyApprovalStatus
   rejectionReason: string | null
   reviewedAt: string | null
   createdAt: string
   updatedAt: string
}
export type CompanyRequestsStats = {
   pending: number
   approved: number
   rejected: number
   totalCompanies: number
}

export type CompanyRequestsPagination = {
   totalCount: number
   page: number
   pageSize: number
}

export type GetCompanyRequestsResult = {
   success: true
   data: CompanyRequests[]
   stats: CompanyRequestsStats
   meta: CompanyRequestsPagination
}

export type GetCompanyRequestsParams = {
   pageNumber?: number
   pageSize?: number
   search?: string
   approvalStatus?: CompanyApprovalStatus | "ALL"
   status?: CompanyStatus | "ALL"
   requestDate?: string
}

export type CompanyRequestActionResult = {
   success: true
   message?: string
   data?: CompanyRequests
}

export type RejectCompanyRequestParams = {
   id: string
   rejectionReason?: string
}

export type AdminCompany = {
   id: string
   companyName: string
   slug: string
   description: string | null
   logoId: string | null
   logoUrl: string | null
   location: string | null
   status: CompanyStatus
   approvalStatus: CompanyApprovalStatus
   rejectionReason: string | null
   reviewedAt: string | null

   _count: {
      jobs: number
   }
}

export type CompaniesStats = {
   totalCompanies: number
   activeCompanies: number
   pendingApproval: number
   rejectedCompanies: number
}

export type CompaniesPagination = {
   totalCount: number
   page: number
   pageSize: number
}
export type GetAllCompaniesResult = {
   success: true
   data: AdminCompany[]
   stats: CompaniesStats
   meta: CompaniesPagination
}

export type GetAllCompaniesParams = {
   page?: number
   sortByNewest?: boolean
   status?: "ALL" | CompanyStatus
   approvalStatus?: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
   country?: string
   countryCode?: string
   city?: string
   cityGeonameId?: number
}
export type RecentJob = {
   id: string
   title: string
   status: JobStatus
   slug: string
   createdAt: string
   _count: {
      applications: number
   }
}
export type GetCompanyDetailsData = {
   company: Company & { approvalStatus: CompanyApprovalStatus }
   stats: {
      totalJobs: number
      totalApplications: number
   }
   recentJobs: RecentJob[]
}

export type GetCompanyDetailsResult = {
   success: true
   data: GetCompanyDetailsData
}
//////////////////
export type CompanyJobsQuery = {
   page?: number
   search?: string
   status?: "ALL" | JobStatus
   employmentType?: "ALL" | EmploymentType
}

export type CompanyJob = {
   id: string
   title: string
   status: JobStatus
   slug: string
   employmentType: EmploymentType
   deadline: string // ISO date string
   createdAt: string // ISO date string
   _count: {
      applications: number
   }
}
export type CompanyJobsStats = {
   totalJobs: number
   openJobs: number
   closedJobs: number
   expiredJobs: number
}
export type CompanyJobsPagination = {
   totalCount: number
   page: number
   pageSize: number
}
export type GetCompanyJobsByAdminResult = {
   success: true
   data: CompanyJob[]
   meta: CompanyJobsPagination
   stats: CompanyJobsStats
}
////////
export type AdminJobsQuery = {
   page?: number
   search?: string
   status?: "ALL" | JobStatus
   employmentType?: "ALL" | EmploymentType
}

export type AdminJob = {
   id: string
   title: string
   status: JobStatus
   slug: string
   employmentType: EmploymentType
   deadline: string
   createdAt: string
   company: {
      id: string
      companyName: string
      slug: string
      logoUrl: string | null
   }
   _count: {
      applications: number
   }
}
export type AdminJobsPagination = {
   totalCount: number
   page: number
   pageSize: number
}
export type AdminJobsStats = {
   totalJobs: number
   openJobs: number
   closedJobs: number
   expiredJobs: number
}
export type GetJobsByAdminResult = {
   success: true
   data: AdminJob[]
   meta: AdminJobsPagination
   stats: AdminJobsStats
}
//////////
export type AdminJobDetails = {
   id: string
   title: string
   slug: string
   description: string
   employmentType: EmploymentType
   experienceRequired: number
   salary: number | null
   deadline: string
   createdAt: string
   status: JobStatus

   company: {
      id: string
      companyName: string
      slug: string
      logoUrl: string | null
      website: string | null
      email: string
      approvalStatus: CompanyApprovalStatus
   }

   skills: {
      skill: {
         skillName: string
      }
   }[]

   _count: {
      applications: number
   }
}

export type GetJobDetailsByAdminResult = {
   success: true
   data: AdminJobDetails
}
///////////
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
   createdAt: string
   updatedAt: string
}

export type GetJobQuestionsByAdminResult = {
   success: true
   data: JobQuestion[]
}
////////////
export type JobApplicationUser = {
   id: string
   firstName: string
   lastName: string
   email: string
   profilePicUrl: string | null
}

export type JobApplication = {
   id: string
   status: ApplicationStatus
   matchScore: number | null
   experience: number | null
   createdAt: string
   user: JobApplicationUser
}

export type JobApplicationsPagination = {
   totalCount: number
   page: number
   pageSize: number
}

export type GetJobApplicationsByAdminResult = {
   success: true
   data: JobApplication[]
   meta: JobApplicationsPagination
   stats: {
      totalCount: number
      statusCounts: StatusCounts
   }
}

export type GetJobApplicationsParams = {
   page?: number
   search?: string
   status?: ApplicationStatus | "ALL"
   experience?: ExperienceFilter
   matchScore?: ApplicationMatchScore
}
//////////////
export type AdminApplicationDetails = {
   id: string
   status: ApplicationStatus
   matchScore: number | null
   recommendation: string | null
   strengths: unknown
   missingSkills: unknown
   resumeType: ResumeType
   cvId: string | null
   cvUrl: string | null
   profileSnapshot: unknown
   createdAt: string
   updatedAt: string

   user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string
      country: string
      birthdate: string
      profilePicUrl: string | null
   }

   job: {
      id: string
      title: string
      slug: string
      employmentType: EmploymentType
      salary: number | null
      status: JobStatus
      createdAt: string

      company: {
         id: string
         companyName: string
         slug: string
         logoUrl: string | null
      }
   }
}

export type GetApplicationDetailsByAdminResult = {
   success: true
   data: AdminApplicationDetails
}
///////////
export type GetProfileSnapshotByAdminResult = {
   success: true
   data: {
      applicationId: string
      userId: string
      profileSnapshot: ProfileSnapshot | null
   }
}
////////
export type GetApplicationsByAdminQuery = {
   page?: number
   search?: string
   status?: ApplicationStatus | "ALL"
   experience?: "ALL" | "0-2" | "3-5" | "6+"
   matchScore?: ApplicationMatchScore
}
export type AdminApplication = {
   id: string
   status: ApplicationStatus
   matchScore: number | null
   experience: number | null
   createdAt: string

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

      company: {
         id: string
         companyName: string
         slug: string
         logoUrl: string | null
      }
   }
}

export type AdminApplicationsPagination = {
   totalCount: number
   page: number
   pageSize: number
}
export type StatusCounts = {
   PENDING: number
   REVIEWING: number
   SHORTLISTED: number
   INTERVIEW: number
   ACCEPTED: number
   REJECTED: number
   WITHDRAWN: number
}
export type GetApplicationsByAdminResult = {
   success: true
   data: AdminApplication[]
   stats: Partial<Record<Exclude<ApplicationStatus, "WITHDRAWN">, number>>
   meta: AdminApplicationsPagination
}

export type GetAdminCompanyApplicationsQuery = {
   companyId: string
   page?: number
   pageSize?: number
   search?: string
   status?: ApplicationStatus | "ALL"
   matchScore?: ApplicationMatchScore
}

export type AdminCompanyApplication = {
   id: string
   status: ApplicationStatus
   matchScore: number | null
   createdAt: string
   user: {
      id: string
      firstName: string
      lastName: string
      email: string
      profilePicUrl: string | null
   }
   job: {
      id: string
      title: string
      slug: string
   }
}

export type GetAdminCompanyApplicationsResult = {
   success: true
   data: AdminCompanyApplication[]
   stats: {
      totalApplications: number
      pending: number
      reviewing: number
      shortlisted: number
      interview: number
      accepted: number
      rejected: number
   }
   meta: AdminApplicationsPagination
}
////////////
export type AdminUser = {
   id: string
   firstName: string
   lastName: string
   email: string
   phone: string
   country: string
   state: string | null
   city: string | null
   profilePicUrl: string | null
   role: UserRole
   accountStatus: UserStatus
   createdAt: string
}

export type AdminUsersStats = {
   totalUsers: number
   activeUsers: number
   inactiveUsers: number
}

export type AdminUsersPagination = {
   totalCount: number
   page: number
   pageSize: number
}

export type GetUsersByAdminQuery = {
   page?: number
   search?: string
   role?: "ALL" | UserRole
   status?: "ALL" | UserStatus
   country?: string
   countryCode?: string
   city?: string
   cityGeonameId?: number
}
export type GetUsersByAdminResult = {
   success: true
   data: AdminUser[]
   stats: AdminUsersStats
   meta: AdminUsersPagination
}
////////////
export type AdminUserDetails = {
   id: string
   firstName: string
   lastName: string
   email: string
   phone: string
   country: string
   birthdate: string
   profilePicId: string | null
   profilePicUrl: string | null
   role: UserRole
   accountStatus: UserStatus
   createdAt: string
   updatedAt: string
}

export type AdminUserStats = {
   applications: number
   savedJobs: number
   messages: number
   languages: number
   skills: number
   notifications: number
}

export type AdminUserProfessionalProfile = ProfessionalProfile & {
   skills: Pick<Skill, "id" | "skillName" | "slug">[]
   languages: UserLanguage[]
}

export type GetAdminUserProfessionalProfileResult = {
   success: true
   data: AdminUserProfessionalProfile | null
}

export type GetUserDetailsByAdminResult = {
   success: true
   data: {
      user: AdminUserDetails
      stats: AdminUserStats
   }
}

export type UpdateUserStatusByAdminArgs = {
   id: string
   status: UserStatus
}

export type UpdateUserStatusByAdminResult = {
   success: true
   message?: string
   data?: AdminUserDetails
}

export type PromoteUserToAdminByAdminArgs = {
   id: string
   role: UserRole
}

export type PromoteUserToAdminByAdminResult = {
   success: true
   message?: string
   data?: AdminUserDetails
}

export type UpdateCompanyStatusByAdminArgs = {
   id: string
   status: CompanyStatus
}

export type UpdateCompanyStatusByAdminResult = {
   success: true
   message?: string
   data?: AdminCompany
}
