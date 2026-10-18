import React from "react"

import {
   Numbers,
   QuestionAnswer,
   RadioButtonChecked,
   CheckBox
} from "@mui/icons-material"
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
      <div>
         <h3 className="text-[13px] font-semibold text-content">
            1. Select Question Type
         </h3>

         <p className="mt-1 text-[11px] text-muted">
            Choose the type of question you want to add.
         </p>

         <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
            {questionTypes.map(item => {
               const Icon = item.icon
               const selected = value === item.type

               return (
                  <button
                     key={item.type}
                     type="button"
                     onClick={() => onChange(item.type)}
                     className={[
                        "min-h-[105px] rounded-lg border p-3 text-center transition",
                        selected
                           ? "border-primary bg-primary-tint shadow-sm"
                           : "border-border bg-surface hover:border-primary hover:bg-primary-tint"
                     ].join(" ")}>
                     <div
                        className={[
                           "mx-auto flex h-9 w-9 items-center justify-center rounded-lg",
                           selected
                              ? "bg-primary/15 text-primary"
                              : "bg-primary-tint text-primary"
                        ].join(" ")}>
                        <Icon sx={{ fontSize: 19 }} />
                     </div>

                     <p className="mt-2 text-[11px] font-semibold text-content">
                        {item.title}
                     </p>

                     <p className="mt-1 text-[9px] leading-3.5 text-muted">
                        {item.description}
                     </p>
                  </button>
               )
            })}
         </div>
      </div>
   )
}

export default QuestionTypeSelector
