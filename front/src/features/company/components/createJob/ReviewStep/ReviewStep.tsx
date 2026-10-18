import React from "react"

import ReviewJobDetails from "./ReviewJobDetails"
import ReviewQuestions from "./ReviewQuestions"
import type { JobFormData } from "@/types/createJob.types"
import type { Question } from "@/types/question.types"

interface ReviewStepProps {
   form: JobFormData
   questions: Question[]

   onBack: () => void
   onEditJob: () => void
   onEditQuestions: () => void
   onPublish: () => void
   isPublishing?: boolean
   mode?: "create" | "edit"
}

const ReviewStep: React.FC<ReviewStepProps> = ({
   form,
   questions,
   onBack,
   onEditJob,
   onEditQuestions,
   onPublish,
   isPublishing = false,
   mode = "create"
}) => {
   return (
      <div>
         {/* Review Content */}
         <div className="space-y-5 px-5 py-5">
            <ReviewJobDetails
               form={form}
               onEdit={onEditJob}
            />

            <ReviewQuestions
               questions={questions}
               onEdit={onEditQuestions}
            />
         </div>

         {/* Navigation */}
         <div className="flex justify-between border-t border-border px-7 py-4">
            <button
               type="button"
               onClick={onBack}
               className="app-button-secondary rounded-md px-4 py-2 text-[12px] transition">
               Back
            </button>

            <button
               type="button"
               onClick={onPublish}
               disabled={isPublishing}
               className="app-button-primary rounded-md px-5 py-2 text-[12px] font-medium transition disabled:opacity-60">
               {isPublishing
                  ? mode === "edit"
                     ? "Saving..."
                     : "Publishing..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Publish Job"}
            </button>
         </div>
      </div>
   )
}

export default ReviewStep
