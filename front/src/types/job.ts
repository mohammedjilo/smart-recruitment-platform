export type { EmploymentType, JobStatus, QuestionType } from "./common/enums"
import type { EmploymentType, JobStatus, QuestionType } from "./common/enums"
import type {
   CompanyDetails as CompanyDetailsEntity,
   CompanySummary as CompanySummaryEntity
} from "./entities/company"

export type CompanySummary = CompanySummaryEntity
export type CompanyDetails = CompanyDetailsEntity

// ==========================================
// 3. نوع JobSummary (للقوائم)
// ==========================================
export type JobSummary = {
   id: string
   title: string
   slug: string
   salary: number
   employmentType: EmploymentType
   createdAt: Date
   // ❌ لا يوجد description للوظيفة (يمكن إضافته إذا أردت، لكن في الغالب لا تحتاجه في القائمة)
   company: CompanySummary
   skills: { skill: { skillName: string } }[]
   _count?: { applications: number } // عدد المتقدمين (اختياري)
   isSaved: boolean
   isApplied: boolean
   hasWithdrawnApplication?: boolean
}

// ==========================================
// 4. نوع JobDetails (للتفاصيل)
// ==========================================
export type JobDetails = {
   id: string
   title: string
   slug: string
   description: string // ✅ وصف الوظيفة (موجود هنا)
   salary: number | null
   employmentType: EmploymentType
   status: string // OPEN, CLOSED, إلخ
   deadline: Date | string
   experienceRequired: number
   createdAt: Date
   updatedAt: Date
   company: CompanyDetails // ✅ يشمل description
   skills: { skill: { skillName: string } }[]
   applicationQuestions: {
      // ✅ أسئلة التقديم (فقط في التفاصيل)
      id: string
      question: string
      type: string
      required: boolean
      order: number
      options: any
   }[]
   _count: { applications: number }
   // حقول محسوبة
   isSaved: boolean // اختياري، يضاف في الـ Service
   isApplied: boolean
   hasWithdrawnApplication?: boolean
}

// ==========================================
// 5. أنواع الـ Response من الـ API
// ==========================================
export type GetJobsResult = {
   success: true
   data: JobSummary[] // مصفوفة من الملخصات
   meta: { totalCount: number; page: number; pageSize: number }
}

export type GetJobByIdResult = {
   success: true
   data: JobDetails
}
export type GetQuestionsResult = {
   success: true
   data: {
      id: string
      question: string
      type: QuestionType
      required: boolean
      order: number
      options: any
   }[]
}

export type GetBasicInformationsResult = {
   success: true
   data: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string
      country: string
      birthdate: Date
      profile: {
         jobTitle: string
      }
      // languages: {
      //    language: {
      //       languageName: string
      //    }
      // }[]
   }
}

export interface GetSaveJobsResult {
   success: true
   data: {
      id: string
      title: string
      employmentType: EmploymentType
      salary: number | null
      deadline: Date
      experienceRequired: number
      slug: string
      company: {
         id: string
         companyName: string
         slug: string
         logoUrl: string | null
      }
      isSaved: boolean
      isApplied: boolean
      hasWithdrawnApplication?: boolean
   }[]
   meta: { totalCount: number; page: number; pageSize: number }
}

export interface ToggleSaveJobsResult {
   success: true
   message: string
   action: "saved" | "removed"
}

export type UpdateJobStatusArgs = {
   id: string
   status: JobStatus
   deadline?: string
}

export type UpdateJobStatusResult = {
   success: true
   message?: string
   data?: JobDetails & { companyId: string }
}
