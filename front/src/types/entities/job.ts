import type { EmploymentType, JobStatus, QuestionType } from "../common/enums"
import type { CompanySummary } from "./company"
import type { JobSkill } from "./skill"

export type { EmploymentType, JobStatus, QuestionType } from "../common/enums"

export type Job = {
   id: string
   title: string
   slug: string
   status: JobStatus
   employmentType: EmploymentType
}

export type JobSummary = Job & {
   salary: number
   createdAt: Date
   company: CompanySummary
   skills: { skill: { skillName: string } }[]
   _count?: { applications: number }
   isSaved: boolean
   isApplied: boolean
}

export type JobQuestion = {
   id: string
   question: string
   type: QuestionType
   required: boolean
   order: number
   options: string[] | null
   minSelection?: number | null
   maxSelection?: number | null
   minNumber?: number | null
   maxNumber?: number | null
   createdAt?: string
   updatedAt?: string
}

export type JobDetails = Job & {
   description: string
   salary: number | null
   deadline: Date | string
   experienceRequired: number
   createdAt: Date
   updatedAt: Date
   company: CompanySummary & { description: string | null; website?: string | null }
   skills: JobSkill[]
   applicationQuestions: JobQuestion[]
   _count: { applications: number }
   isSaved: boolean
   isApplied: boolean
}

export type CompanyJob = Job & {
   description: string
   salary: number | null
   deadline: string
   experienceRequired: number
   createdAt: string
   updatedAt: string
   companyId: string
   skills: JobSkill[]
   applicationQuestions: JobQuestion[]
}
