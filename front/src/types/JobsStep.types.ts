import type { EmploymentType, JobStatus } from "./job"

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
   deadline: string
   createdAt: string
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
   status: string
   data: {
      jobs: CompanyJob[]
      pagination: CompanyJobsPagination
      stats: CompanyJobsStats
   }
}
