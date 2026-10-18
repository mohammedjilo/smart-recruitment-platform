import type { CompanyJob } from "@/types/company"
import type { JobFormData } from "@/types/createJob.types"
import type { Question } from "@/types/question.types"

export type JobFormMode = "create" | "edit"

export type JobFormInitialData = {
   form: JobFormData
   questions: Question[]
}

export type JobFormProps = {
   mode: JobFormMode
   initialData?: JobFormInitialData
   jobId?: string
   initialStep?: number
}

export const emptyJobForm: JobFormData = {
   title: "",
   employmentType: "",
   description: "",
   experience: "",
   salary: 0,
   deadline: "",
   skills: [],
   status: "OPEN"
}

export const mapCompanyJobToFormData = (job: CompanyJob): JobFormInitialData => ({
   form: {
      title: job.title,
      employmentType: job.employmentType,
      description: job.description,
      experience: String(job.experienceRequired),
      salary: job.salary ?? 0,
      deadline: job.deadline.split("T")[0],
      skills: job.skills.map(item => item.skill.skillName),
      status: job.status
   },
   questions: job.applicationQuestions.map(question => ({
      id: question.id,
      type: question.type,
      question: question.question,
      required: question.required,
      order: question.order,
      options: question.options ?? undefined,
      minSelections: question.minSelection,
      maxSelections: question.maxSelection,
      minValue: question.minNumber,
      maxValue: question.maxNumber
   }))
})
