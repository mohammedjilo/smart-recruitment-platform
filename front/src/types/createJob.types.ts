export type { EmploymentType, JobStatus } from "./common/enums"
import type { EmploymentType, JobStatus } from "./common/enums"
import type { CreateJobInput } from "@smart-recruitment/validation"

export interface JobFormData {
   title: string
   employmentType: EmploymentType | ""
   description: string
   experience: string
   salary: number
   deadline: string
   skills: string[]
   status: JobStatus
}

export type CreateApplicationPayload = CreateJobInput & {
   status: JobStatus
}

export interface CreateApplicationResult {
   success: true
   data: {
      id: string
      companyId: string
   }
   message?: string
}
