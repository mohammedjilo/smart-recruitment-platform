import { Box, Button, Typography } from "@mui/material"
import type { JobQuestion } from "@/types/company"
import { formatQuestionType } from "@/utils/jobDetails.utils"

type ApplicationQuestionsProps = {
   questions: JobQuestion[]
   onManageQuestions: () => void
}

const ApplicationQuestions = ({
   questions,
   onManageQuestions
}: ApplicationQuestionsProps) => {
   const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)

   return (
      <section className="bg-surface rounded-xl border p-5">
         <Box className="flex items-center justify-between gap-4">
            <Typography className="text-content text-base! font-semibold!">
               Application Questions ({questions.length})
            </Typography>

            <Button
               onClick={onManageQuestions}
               variant="outlined"
               color="primary"
               className="rounded-lg! px-4! py-2! text-xs! font-semibold! transition!">
               View / Manage Questions
            </Button>
         </Box>

         {sortedQuestions.length === 0 ? (
            <Box className="py-10 text-center">
               <Typography className="text-muted text-sm!">
                  No application questions added for this job.
               </Typography>
            </Box>
         ) : (
            <Box className="mt-5 space-y-3">
               {sortedQuestions.map((question, index) => (
                  <Box
                     key={question.id}
                     className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-4 rounded-lg py-2">
                     <Box className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50 text-xs font-bold text-[#4f20e8]">
                        {index + 1}
                     </Box>

                     <Typography className="text-sm!">{question.question}</Typography>

                     <Typography className="border-border! bg-bg! text-muted! rounded-md! border! px-2.5! py-1! text-[11px]! font-medium! whitespace-nowrap!">
                        {formatQuestionType(question.type)}
                     </Typography>

                     <Typography
                        className={`rounded-md! px-2.5! py-1! text-[11px]! font-medium! whitespace-nowrap! ${
                           question.required
                              ? "bg-violet-50! text-violet-600"
                              : "text-muted bg-slate-100!"
                        } `}>
                        {question.required ? "Required" : "Optional"}
                     </Typography>
                  </Box>
               ))}
            </Box>
         )}
      </section>
   )
}

export default ApplicationQuestions
