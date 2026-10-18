export type { Question, QuestionType } from "./entities/question"
import type { QuestionType } from "./entities/question"

export interface QuestionFormData {
   type: QuestionType
   question: string
   required: boolean
   order: number

   allowDecimal: boolean
   minValue: string
   maxValue: string

   options: string[]

   minSelections: string
   maxSelections: string
}
