import React, { useState } from "react"
import { Box, Button, Typography } from "@mui/material"

import QuestionsHeader from "./QuestionsHeader"
import QuestionsList from "./QuestionsList"
import AddQuestionModal from "./AddQuestionModal"
import type { Question } from "@/types/question.types"

interface QuestionsStepProps {
   questions: Question[]
   onQuestionsChange: React.Dispatch<React.SetStateAction<Question[]>>
   onBack: () => void
   onNext: () => void
}

const QuestionsStep: React.FC<QuestionsStepProps> = ({
   questions,
   onQuestionsChange,
   onBack,
   onNext
}) => {
   const [enabled, setEnabled] = useState(true)

   const [modalOpen, setModalOpen] = useState(false)

   const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

   const openAddModal = () => {
      setEditingQuestion(null)
      setModalOpen(true)
   }

   const openEditModal = (question: Question) => {
      setEditingQuestion(question)
      setModalOpen(true)
   }

   const handleAddQuestion = (question: Question) => {
      onQuestionsChange(previous => {
         if (editingQuestion) {
            return previous.map(item => (item.id === question.id ? question : item))
         }

         return [
            ...previous,
            {
               ...question,
               order: previous.length + 1
            }
         ]
      })

      setModalOpen(false)
      setEditingQuestion(null)
   }

   const handleDeleteQuestion = (id: string) => {
      onQuestionsChange(previous =>
         previous
            .filter(question => question.id !== id)
            .map((question, index) => ({
               ...question,
               order: index + 1
            }))
      )
   }

   return (
      <Box>
         {/* Questions Content */}
         <Box className="px-5 py-5">
            <QuestionsHeader
               enabled={enabled}
               onAdd={openAddModal}
               onToggle={() => setEnabled(previous => !previous)}
            />

            {enabled && (
               <Box className="mt-5">
                  <QuestionsList
                     questions={questions}
                     onDelete={handleDeleteQuestion}
                     onEdit={openEditModal}
                  />

                  {questions.length > 0 && (
                     <Typography className="mt-3! text-[10px]!" color="textSecondary">
                        You can reorder questions by dragging the handle on the left.
                     </Typography>
                  )}
               </Box>
            )}

            {!enabled && (
               <Box className="mt-5 rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <Typography className="text-[12px]! font-medium!" color="textSecondary">
                     Application questions are disabled
                  </Typography>

                  <Typography className="mt-1! text-[10px]!" color="textSecondary">
                     Enable questions if you want to screen candidates with custom
                     questions.
                  </Typography>
               </Box>
            )}
         </Box>

         {/* Step Navigation */}
         <Box className="border-border flex justify-between border-t px-7 py-4">
            <Button
               className="rounded-md! px-4! py-2! text-sm! normal-case! transition!"
               variant="outlined"
               onClick={onBack}>
               Back
            </Button>

            <Button
               className="rounded-md! px-5! py-2! text-sm! font-medium! normal-case! transition!"
               variant="contained"
               onClick={onNext}>
               Next
            </Button>
         </Box>

         {/* Add / Edit Question Modal */}
         <AddQuestionModal
            editingQuestion={editingQuestion}
            open={modalOpen}
            onAdd={handleAddQuestion}
            onClose={() => {
               setModalOpen(false)
               setEditingQuestion(null)
            }}
         />
      </Box>
   )
}

export default QuestionsStep
