import React from "react"
import { Box, Typography } from "@mui/material"

import QuestionCard from "./QuestionCard"
import type { Question } from "@/types/question.types"

interface QuestionsListProps {
   questions: Question[]
   onEdit: (question: Question) => void
   onDelete: (id: string) => void
}

const QuestionsList: React.FC<QuestionsListProps> = ({ questions, onEdit, onDelete }) => {
   if (questions.length === 0) {
      return (
         <Box className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
            <Typography className="text-[12px]! font-medium!" color="textSecondary">
               No application questions yet
            </Typography>

            <Typography className="mt-1! text-[10px]!" color="textSecondary">
               Add questions to better screen candidates.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="overflow-hidden rounded-lg border border-border bg-surface">
         {questions.map(question => (
            <QuestionCard
               key={question.id}
               question={question}
               onDelete={onDelete}
               onEdit={onEdit}
            />
         ))}
      </Box>
   )
}

export default QuestionsList
