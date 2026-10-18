import type { JobFormData } from "@/types/createJob.types"

export type JobDetailsStepProps = {
   form: JobFormData
   onChange: <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => void
   onNext: () => void
   onCancel: () => void
}

export type JobDetailsFieldsProps = Pick<JobDetailsStepProps, "form" | "onChange">