import React from "react"

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
         <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
            <p className="text-[12px] font-medium text-muted">
               No application questions yet
            </p>

            <p className="mt-1 text-[10px] text-muted">
               Add questions to better screen candidates.
            </p>
         </div>
      )
   }

   return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
         {questions.map(question => (
            <QuestionCard
               key={question.id}
               question={question}
               onEdit={onEdit}
               onDelete={onDelete}
            />
         ))}
      </div>
   )
}

export default QuestionsList
