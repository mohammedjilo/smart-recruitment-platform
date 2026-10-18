import { Numbers, QuestionAnswer, RadioButtonChecked, Groups } from "@mui/icons-material"

import type { EmploymentType } from "@/types/createJob.types"

export const employmentTypes: {
   value: EmploymentType
   label: string
}[] = [
   {
      value: "FULL_TIME",
      label: "Full Time"
   },
   {
      value: "PART_TIME",
      label: "Part Time"
   },
   {
      value: "CONTRACT",
      label: "Contract"
   },
   {
      value: "INTERNSHIP",
      label: "Internship"
   },
   {
      value: "FREELANCE",
      label: "Freelance"
   },
   {
      value: "REMOTE",
      label: "Remote"
   }
]

export const experienceOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"]

export const questionTypes = [
   {
      title: "Yes/No",
      description: "Simple yes or no questions",
      icon: RadioButtonChecked
   },
   {
      title: "Text",
      description: "Open-ended text answers",
      icon: QuestionAnswer
   },
   {
      title: "Number",
      description: "Numeric answers",
      icon: Numbers
   },
   {
      title: "Single Choice",
      description: "Choose one option",
      icon: RadioButtonChecked
   },
   {
      title: "Multiple Choice",
      description: "Choose multiple options",
      icon: Groups
   }
]
