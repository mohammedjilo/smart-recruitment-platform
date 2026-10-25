import React from "react"

import { DeleteOutlined, DragIndicator, EditOutlined } from "@mui/icons-material"

import { Box, IconButton, Typography } from "@mui/material"
import type { Question, QuestionType } from "@/types/question.types"

interface QuestionCardProps {
   question: Question
   onEdit: (question: Question) => void
   onDelete: (id: string) => void
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onEdit, onDelete }) => {
   return (
      <Box className="group border-border flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
         {/* Drag */}
         <button
            className="text-muted mt-1 cursor-grab"
            type="button">
            <DragIndicator className="text-[17px]!" />
         </button>

         {/* Number */}
         <Box className="border-border bg-bg text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold">
            {question.order}
         </Box>

         {/* Content */}
         <Box className="min-w-0 flex-1">
            <Box className="flex flex-wrap items-center gap-2">
               <Typography className="text-[11px]! font-medium!">
                  {question.question}
               </Typography>

               <span className="border-border bg-bg text-muted rounded border px-2 py-0.5 text-[9px]">
                  {getQuestionTypeLabel(question.type)}
               </span>

               {question.required && (
                  <span className="rounded bg-violet-50 px-2 py-0.5 text-[9px] font-medium text-violet-600">
                     Required
                  </span>
               )}
            </Box>

            {/* Options */}
            {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") &&
               question.options && (
                  <Box className="mt-3 space-y-1.5">
                     {question.options.map((option, index) => (
                        <Box
                           className="flex items-center gap-2"
                           key={index}>
                           <Box className="h-4 w-4 rounded-full border border-slate-300" />

                           <Typography
                              className="text-[10px]!"
                              color="textSecondary">
                              {option}
                           </Typography>
                        </Box>
                     ))}
                  </Box>
               )}
         </Box>

         {/* Actions */}
         <Box className="flex shrink-0 items-center gap-1">
            <IconButton
               className="text-muted!"
               color="primary"
               size="small"
               onClick={() => onEdit(question)}>
               <EditOutlined className="text-[17px]!" />
            </IconButton>

            <IconButton
               className="text-red-500!"
               size="small"
               onClick={() => onDelete(question.id)}>
               <DeleteOutlined className="text-[17px]!" />
            </IconButton>
         </Box>
      </Box>
   )
}

const getQuestionTypeLabel = (type: QuestionType) => {
   const labels: Record<QuestionType, string> = {
      YES_NO: "Yes / No",
      TEXT: "Text",
      NUMBER: "Number",
      SINGLE_CHOICE: "Single Choice",
      MULTIPLE_CHOICE: "Multiple Choice"
   }

   return labels[type]
}

export default QuestionCard
