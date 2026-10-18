import type { JobStatus } from "@/types/createJob.types"
import type { QuestionType } from "@/types/question.types"
import { JOB_STATUS_TONE_MAP, getStatusClassName } from "@/utils/statusStyles"
import { getJobDeadlineInfo } from "@/utils/jobDeadline"
export { formatDate } from "@/utils/formatDate"

export const formatQuestionType = (type: QuestionType) => {
   const labels: Record<QuestionType, string> = {
      YES_NO: "Yes / No",
      TEXT: "Text",
      NUMBER: "Number",
      SINGLE_CHOICE: "Single Choice",
      MULTIPLE_CHOICE: "Multiple Choice"
   }

   return labels[type]
}

export const getDaysRemaining = (deadline: string) => {
   const deadlineInfo = getJobDeadlineInfo(deadline)
   return {
      text: deadlineInfo.text === "Today" ? "Deadline is today" : deadlineInfo.text,
      color: deadlineInfo.className
   }
}

export const formatSalary = (salary: number | null) => {
   if (salary === null) {
      return "Not specified"
   }

   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
   }).format(salary)
}

export const getStatusStyle = (status: JobStatus) => {
   return getStatusClassName(status, JOB_STATUS_TONE_MAP)
}
