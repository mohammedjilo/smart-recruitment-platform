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
      <Box className="group flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0">
         {/* Drag */}
         <button
            type="button"
            className="mt-1 cursor-grab text-muted">
            <DragIndicator sx={{ fontSize: 17 }} />
         </button>

         {/* Number */}
         <Box className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-bg text-[10px] font-semibold text-muted">
            {question.order}
         </Box>

         {/* Content */}
         <Box className="min-w-0 flex-1">
            <Box className="flex flex-wrap items-center gap-2">
               <Typography className="text-[11px]! font-medium!">
                  {question.question}
               </Typography>

               <span className="rounded border border-border bg-bg px-2 py-0.5 text-[9px] text-muted">
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
                           key={index}
                           className="flex items-center gap-2">
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
               size="small"
               onClick={() => onEdit(question)}
               color="primary"
               className="text-muted!">
               <EditOutlined sx={{ fontSize: 17 }} />
            </IconButton>

            <IconButton
               size="small"
               onClick={() => onDelete(question.id)}
               className="text-red-500!">
               <DeleteOutlined sx={{ fontSize: 17 }} />
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
