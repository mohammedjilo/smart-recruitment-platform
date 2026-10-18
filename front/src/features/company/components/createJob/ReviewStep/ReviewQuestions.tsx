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
      <section className="rounded-[9px] border border-border bg-surface">
         {/* Header */}
         <Box className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[14px] font-semibold text-[#172033]">
               Review Questions ({questions.length})
            </h2>

            <button
               type="button"
               onClick={onEdit}
               className="border-primary text-primary hover:bg-primary-tint flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition">
               <EditOutlined sx={{ fontSize: 14 }} />
               Edit Questions
            </button>
         </Box>

         {/* Questions */}
         {questions.length > 0 ? (
            <Box className="Boxide-y Boxide-slate-100">
               {questions.map((question, index) => (
                  <ReviewQuestionItem
                     key={question.id}
                     question={question}
                     index={index}
                     formatType={formatQuestionType}
                  />
               ))}
            </Box>
         ) : (
            <Box className="px-5 py-10 text-center">
               <p className="text-[12px] font-medium text-muted">
                  No application questions
               </p>

               <p className="mt-1 text-[10px] text-muted">Questions are optional.</p>
            </Box>
         )}

         {/* Info */}
         <Box className="mx-4 mt-3 mb-4 flex items-center gap-2 rounded-md border border-violet-100 bg-violet-50 px-3 py-2.5">
            <InfoOutlined
               sx={{
                  fontSize: 14,
                  color: "#6d28d9"
               }}
            />

            <p className="text-[10px] text-muted">
               Questions are optional, but adding them helps you screen candidates better.
            </p>
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
            <span className="inline-flex rounded-md border border-border bg-bg px-2 py-1 text-[9px] font-medium text-muted">
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
