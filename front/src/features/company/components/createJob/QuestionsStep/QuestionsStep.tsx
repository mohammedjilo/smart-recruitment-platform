import React, { useState } from "react"

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
      <div>
         {/* Questions Content */}
         <div className="px-5 py-5">
            <QuestionsHeader
               enabled={enabled}
               onToggle={() => setEnabled(previous => !previous)}
               onAdd={openAddModal}
            />

            {enabled && (
               <div className="mt-5">
                  <QuestionsList
                     questions={questions}
                     onEdit={openEditModal}
                     onDelete={handleDeleteQuestion}
                  />

                  {questions.length > 0 && (
                     <p className="mt-3 text-[10px] text-muted">
                        You can reorder questions by dragging the handle on the left.
                     </p>
                  )}
               </div>
            )}

            {!enabled && (
               <div className="mt-5 rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <p className="text-[12px] font-medium text-muted">
                     Application questions are disabled
                  </p>

                  <p className="mt-1 text-[10px] text-muted">
                     Enable questions if you want to screen candidates with custom
                     questions.
                  </p>
               </div>
            )}
         </div>

         {/* Step Navigation */}
         <div className="flex justify-between border-t border-border px-7 py-4">
            <button
               type="button"
               onClick={onBack}
               className="app-button-secondary rounded-md px-4 py-2 text-[12px] transition">
               Back
            </button>

            <button
               type="button"
               onClick={onNext}
               className="app-button-primary rounded-md px-5 py-2 text-[12px] font-medium transition">
               Next
            </button>
         </div>

         {/* Add / Edit Question Modal */}
         <AddQuestionModal
            open={modalOpen}
            onClose={() => {
               setModalOpen(false)
               setEditingQuestion(null)
            }}
            onAdd={handleAddQuestion}
            editingQuestion={editingQuestion}
         />
      </div>
   )
}

export default QuestionsStep
