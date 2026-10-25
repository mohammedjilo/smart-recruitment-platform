import type { CompanyApprovalStatus, CompanyStatus } from "../common/enums"

export type { CompanyApprovalStatus, CompanyStatus } from "../common/enums"

export type Company = {
   id: string
   companyName: string
   slug: string
   description: string | null
   logoId: string | null
   logoUrl: string | null
   phone: string
   email: string
   website: string | null
   location: string | null
   country?: string | null
   countryCode?: string | null
   state?: string | null
   stateCode?: string | null
   city?: string | null
   cityGeonameId?: number | null
   status: CompanyStatus
   approvalStatus?: CompanyApprovalStatus
   createdAt: string
   updatedAt: string
   _count?: { jobs: number }
}

export type CompanySummary = Pick<
   Company,
   "id" | "companyName" | "slug" | "logoUrl" | "location"
> & {
   description?: string | null
   website?: string | null
   _count?: { jobs: number }
}
export type CompanyDetails = Company & { approvalStatus?: CompanyApprovalStatus }
