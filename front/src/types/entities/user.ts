import type { AccountStatus, UserRole, UserStatus } from "../common/enums"
import type { Education } from "./education"
import type { Experience } from "./experience"
import type { Project } from "./project"
import type { Certificate } from "./certificate"
import type { UserLanguage } from "./language"
import type { UserSkill } from "./skill"

export type { AccountStatus, UserRole, UserStatus } from "../common/enums"

export type User = {
   id: string
   firstName?: string
   lastName?: string
   name?: string
   username?: string
   birthdate: Date | string
   bio?: string
   email?: string
   phone?: string
   country?: string
   countryCode?: string | null
   state?: string | null
   stateCode?: string | null
   city?: string | null
   cityGeonameId?: number | null
   profilePicUrl: string | null
   role?: UserRole
   accountStatus?: AccountStatus | UserStatus
   createdAt: Date | string
}

export type UserProfileStats = {
   applications: number
   savedJobs: number
   messages: number
   skills: number
   certificates: number
   projects: number
   experiences: number
}

export type ProfessionalProfile = {
   id: string
   jobTitle: string | null
   summary: string | null
   yearsOfExperience: number | null
   cvPath: string | null
   userId: string
   createdAt: string
   updatedAt: string
   educations: Education[]
   experiences: Experience[]
   projects: Project[]
   certificates: Certificate[]
}

export type CompleteUserProfile = User & {
   firstName: string
   lastName: string
   email: string
   phone: string
   country: string
   countryCode: string | null
   state: string | null
   stateCode: string | null
   city: string | null
   cityGeonameId: number | null
   birthdate: string
   profilePicId: string | null
   profilePicUrl: string | null
   role: UserRole
   accountStatus: AccountStatus
   updatedAt: string
   professionalProfile: ProfessionalProfile | null
   skills: UserSkill[]
   languages: UserLanguage[]
   stats: UserProfileStats
}
