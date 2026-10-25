import React from "react"
import { Box, Button } from "@mui/material"

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
   isPublishing?: boolean
   mode?: "create" | "edit"
}

const ReviewStep: React.FC<ReviewStepProps> = ({
   form,
   questions,
   onBack,
   onEditJob,
   onEditQuestions,
   isPublishing = false,
   mode = "create"
}) => {
   return (
      <Box>
         {/* Review Content */}
         <Box className="space-y-5 px-5 py-5">
            <ReviewJobDetails
               form={form}
               onEdit={onEditJob}
            />

            <ReviewQuestions
               questions={questions}
               onEdit={onEditQuestions}
            />
         </Box>

         {/* Navigation */}
         <Box className="border-border flex justify-between border-t px-7 py-4">
            <Button
               className="rounded-md! px-4! py-2! text-sm! normal-case! transition!"
               variant="outlined"
               onClick={onBack}>
               Back
            </Button>

            <Button
               className="rounded-md! px-5! py-2! text-[12px]! font-medium! normal-case! transition!"

               type="submit"
               variant="contained"
               disabled={isPublishing}>
               {isPublishing
                  ? mode === "edit"
                     ? "Saving..."
                     : "Publishing..."
                  : mode === "edit"
                    ? "Save Changes"
                    : "Publish Job"}
            </Button>
         </Box>
      </Box>
   )
}

export default ReviewStep
