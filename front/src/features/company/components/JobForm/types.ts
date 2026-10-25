import type { CompanyJob } from "@/types/company"
import { createJobSchema, jobStatusValues } from "@smart-recruitment/validation"
import { z } from "zod"
import type { JobFormData } from "@/types/createJob.types"
import type { Question } from "@/types/question.types"

export type JobFormMode = "create" | "edit"

export const jobFormSchema = createJobSchema
   .omit({ experienceRequired: true })
   .extend({
      employmentType: z
         .union([z.literal(""), createJobSchema.shape.employmentType])
         .pipe(
            z.enum(createJobSchema.shape.employmentType.options, {
               error: "Invalid option"
            })
         ),
      experience: z
         .string()
         .min(1, "Experience is required")
         .transform(value => Number.parseInt(value, 10))
         .pipe(createJobSchema.shape.experienceRequired),
      salary: z
         .number()
         .min(0, "Salary cannot be negative")
         .transform(value => (value === 0 ? undefined : value))
         .pipe(createJobSchema.shape.salary.unwrap().unwrap().optional()),
      status: z.enum(jobStatusValues)
   })
   .transform(({ experience, ...values }) => ({
      ...values,
      experienceRequired: experience
   }))

export type JobFormInput = z.input<typeof jobFormSchema>
export type JobFormOutput = z.output<typeof jobFormSchema>
export type JobQuestionInput = NonNullable<JobFormInput["questions"]>[number]

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

export const mapQuestionToFormInput = (question: Question): JobQuestionInput => ({
   id: question.id,
   type: question.type,
   question: question.question,
   required: question.required,
   order: question.order,
   options: question.options ?? [],
   minSelection: question.minSelections ?? undefined,
   maxSelection: question.maxSelections ?? undefined,
   minNumber: question.minValue ?? undefined,
   maxNumber: question.maxValue ?? undefined
})

export const getJobFormDefaults = (
   form: JobFormData = emptyJobForm,
   questions: Question[] = []
): JobFormInput => ({
   ...form,
   questions: questions.map(mapQuestionToFormInput)
})

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
