import React from "react"

import {
   Numbers,
   QuestionAnswer,
   RadioButtonChecked,
   CheckBox
} from "@mui/icons-material"
import { Box, Typography } from "@mui/material"
import type { QuestionType } from "@/types/question.types"

interface QuestionTypeSelectorProps {
   value: QuestionType
   onChange: (type: QuestionType) => void
}

const questionTypes = [
   {
      type: "YES_NO" as QuestionType,
      title: "Yes / No",
      description: "Simple yes or no questions",
      icon: RadioButtonChecked
   },
   {
      type: "TEXT" as QuestionType,
      title: "Text",
      description: "Open-ended text answers",
      icon: QuestionAnswer
   },
   {
      type: "NUMBER" as QuestionType,
      title: "Number",
      description: "Numeric answers",
      icon: Numbers
   },
   {
      type: "SINGLE_CHOICE" as QuestionType,
      title: "Single Choice",
      description: "Choose one option from a list",
      icon: RadioButtonChecked
   },
   {
      type: "MULTIPLE_CHOICE" as QuestionType,
      title: "Multiple Choice",
      description: "Choose multiple options from a list",
      icon: CheckBox
   }
]

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
   value,
   onChange
}) => {
   return (
      <Box>
         <Typography className="text-content! text-[13px]! font-semibold">
            1. Select Question Type
         </Typography>

         <Typography
            className="mt-1! text-[11px]!"
            color="textSecondary">
            Choose the type of question you want to add.
         </Typography>

         <Box className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
            {questionTypes.map(item => {
               const Icon = item.icon
               const selected = value === item.type

               return (
                  <button
                     className={[
                        "min-h-26.25 rounded-lg border p-3 text-center transition",
                        selected
                           ? "border-primary bg-primary-tint shadow-sm"
                           : "border-border bg-surface hover:border-primary hover:bg-primary-tint"
                     ].join(" ")}
                     key={item.type}
                     type="button"
                     onClick={() => onChange(item.type)}>
                     <Box className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <Icon className="text-[19px]!" />
                     </Box>

                     <Typography className="text-content! mt-2! text-[11px]! font-semibold!">
                        {item.title}
                     </Typography>

                     <Typography className="mt-1! text-[9px]! leading-3.5!" color="textSecondary">
                        {item.description}
                     </Typography>
                  </button>
               )
            })}
         </Box>
      </Box>
   )
}

export default QuestionTypeSelector
