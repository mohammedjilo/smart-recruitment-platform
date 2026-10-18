import type { QuestionType } from "../common/enums"

export type { QuestionType } from "../common/enums"

export interface Question {
   id: string
   type: QuestionType
   question: string
   required: boolean
   order: number
   allowDecimal?: boolean
   minValue?: number | null
   maxValue?: number | null
   options?: string[]
   minSelections?: number | null
   maxSelections?: number | null
}
