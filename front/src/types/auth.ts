import type { CompanyApprovalStatus } from "@/types/common/enums"

// Login types
export type LoginBody = {
   email: string
   password: string
   role: "user" | "company"
}

export type CompanyRegistrationStatusResponse = {
   registrationStatus: "PENDING" | "REJECTED"
   resubmitted?: boolean
   company: {
      id: string
      companyName: string
      slug: string
      description: string | null
      email: string
      phone: string
      country: string | null
      countryCode: string | null
      state: string | null
      stateCode: string | null
      city: string | null
      cityGeonameId: number | null
      logoUrl: string | null
      website: string | null
      location: string | null
      rejectionReason: string | null
      reviewedAt: string | null
      submittedAt: string
   }
}

export type LoginResult = {
   success: true
   message: string
   data:
      | {
           token: string
           user: {
              id: string
              firstName: string
              lastName: string
              email: string
              profilePicUrl: string | null
              role: "USER" | "ADMIN"
              accountStatus: "ACTIVE" | "DEACTIVATED"
           }
        }
      | {
           token: string
           company: {
              id: string
              companyName: string
              slug: string
              email: string
              logoUrl: string | null
              website: string | null
              status: "ACTIVE" | "DEACTIVATED"
              approvalStatus: CompanyApprovalStatus
           }
        }
      | CompanyRegistrationStatusResponse
}
// Register types
export type RegisterUserBody = {
   firstName: string
   lastName: string
   email: string
   password: string
   country: string
   countryCode: string
   state?: string
   stateCode?: string
   city: string
   cityGeonameId: number
   birthdate: string
   phone: string
   image: File | null
   role: "user"
}

export type RegisterCompanyBody = {
   companyName: string
   slug: string
   description?: string
   email: string
   password: string
   phone: string
   location: string
   country: string
   countryCode: string
   state?: string
   stateCode?: string
   city: string
   cityGeonameId: number
   website?: string
   logo: File | null
   role: "company"
}

export type RegisterResult = {
   success: true
   message: string
   data?: CompanyRegistrationStatusResponse
}
