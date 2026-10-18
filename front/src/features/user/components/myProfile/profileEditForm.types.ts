import type {
   Certificate,
   Education,
   Experience,
   ProfessionalProfile,
   Project,
   UserLanguage
} from "@/types/user"
import type { LanguageLevel } from "@/types/language"

export type ProfileEditFormType =
   | "professionalProfile"
   | "skill"
   | "language"
   | "education"
   | "experience"
   | "project"
   | "certificate"

export type SkillProfileEditData = {
   id: string
   skillName: string
   originalSkill: string
   allSkills: string[]
}

export type ProfileEditDataByType = {
   professionalProfile: ProfessionalProfile
   skill: SkillProfileEditData
   language: UserLanguage
   education: Education
   experience: Experience
   project: Project
   certificate: Certificate
}

export type ProfileEditFormValues = {
   id: string
   companyName?: string
   position?: string
   description?: string | null
   startDate?: string
   endDate?: string | null
   university?: string
   degree?: string
   major?: string
   title?: string
   certificateName?: string
   organization?: string
   skillName?: string
   originalSkill?: string
   allSkills?: string[]
   level?: LanguageLevel
   jobTitle?: string | null
   summary?: string | null
   yearsOfExperience?: number | string | null
   cvPath?: string | null
}

export type ProfileEditField = Exclude<
   keyof ProfileEditFormValues,
   "id" | "originalSkill" | "allSkills" | "level"
>
