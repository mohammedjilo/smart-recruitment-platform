import React from "react"

import { EditOutlined, InfoOutlined } from "@mui/icons-material"
import type { Question } from "@/types/question.types"
import { Box, Typography } from "@mui/material"

interface ReviewQuestionsProps {
   questions: Question[]
   onEdit: () => void
}

const ReviewQuestions: React.FC<ReviewQuestionsProps> = ({ questions, onEdit }) => {
   const formatQuestionType = (type: Question["type"]) => {
      switch (type) {
         case "YES_NO":
            return "Yes / No"

         case "TEXT":
            return "Text"

         case "NUMBER":
            return "Number"

         case "SINGLE_CHOICE":
            return "Single Choice"

         case "MULTIPLE_CHOICE":
            return "Multiple Choice"

         default:
            return type
      }
   }

   return (
      <section className="border-border bg-surface rounded-[9px] border">
         {/* Header */}
         <Box className="border-border flex items-center justify-between border-b px-5 py-4">
            <Typography
               className="text-[14px]! font-semibold!"
               variant="h2">
               Review Questions ({questions.length})
            </Typography>

            <button
               className="border-primary text-primary hover:bg-primary-tint flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition"
               type="button"
               onClick={onEdit}>
               <EditOutlined className="text-sm!" />
               Edit Questions
            </button>
         </Box>

         {/* Questions */}
         {questions.length > 0 ? (
            <Box className="Boxide-y Boxide-slate-100">
               {questions.map((question, index) => (
                  <ReviewQuestionItem
                     key={question.id}
                     formatType={formatQuestionType}
                     index={index}
                     question={question}
                  />
               ))}
            </Box>
         ) : (
            <Box className="px-5 py-10 text-center">
               <Typography className="text-[12px]! font-medium!" color="textSecondary">
                  No application questions
               </Typography>

               <Typography className="mt-1! text-[10px]!" color="textSecondary">
                  Questions are optional.
               </Typography>
            </Box>
         )}

         {/* Info */}
         <Box className="mx-4 mt-3 mb-4 flex items-center gap-2 rounded-md border border-violet-100 bg-violet-50 px-3 py-2.5">
            <InfoOutlined className="text-sm! text-[#6d28d9]!" />

            <Typography className="text-[10px]!" color="textSecondary">
               Questions are optional, but adding them helps you screen candidates better.
            </Typography>
         </Box>
      </section>
   )
}

interface ReviewQuestionItemProps {
   question: Question
   index: number
   formatType: (type: Question["type"]) => string
}

const ReviewQuestionItem: React.FC<ReviewQuestionItemProps> = ({
   question,
   index,
   formatType
}) => {
   return (
      <Box className="flex items-start gap-3 px-5 py-3.5">
         {/* Number */}
         <Box className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-[10px] font-medium text-violet-600">
            {index + 1}
         </Box>

         {/* Question */}
         <Box className="min-w-0 flex-1">
            <Typography className="text-[11px]! leading-5! font-medium!">
               {question.question}
            </Typography>

            {/* Options */}
            {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") &&
               question.options &&
               question.options.length > 0 && (
                  <Typography
                     className="mt-1! text-xs!"
                     color="textSecondary">
                     <span className="font-medium">Options:</span>{" "}
                     {question.options.join(", ")}
                  </Typography>
               )}
         </Box>

         {/* Type */}
         <Box className="hidden shrink-0 sm:block">
            <span className="border-border bg-bg text-muted inline-flex rounded-md border px-2 py-1 text-[9px] font-medium">
               {formatType(question.type)}
            </span>
         </Box>

         {/* Required */}
         {question.required && (
            <Box className="shrink-0">
               <span className="inline-flex rounded-md bg-violet-50 px-2 py-1 text-[9px] font-medium text-violet-600">
                  Required
               </span>
            </Box>
         )}
      </Box>
   )
}

export default ReviewQuestions
